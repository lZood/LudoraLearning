// Materializa la tabla `activity_concepts` a partir del tagging de los ejercicios
// (Master Plan §3.2 / §7 · fase F2 · T2.6). Lee `activities.content.exercises[].meta`
// (que rellena tag-exercises.mjs) y, por cada actividad, suma un peso por concepto:
//   - conceptId primario          → +1.0
//   - cada slug extra en conceptIds (distinto del primario) → +0.5
// Luego hace UPSERT idempotente en activity_concepts(activity_id, concept_id, weight)
// resolviendo slug→id contra `concepts`. ON CONFLICT actualiza el weight.
//
// La tabla activity_concepts ya existe (migración 0028). Es ADITIVO: por defecto solo
// inserta/actualiza (no borra). Con --prune elimina filas obsoletas de una actividad
// (conceptos que ya no aparecen en su tagging) — útil tras re-taggear, pero puede pisar
// filas añadidas a mano, por eso NO es el comportamiento por defecto.
//
// SUPUESTO: el `weight` es el peso bruto acumulado descrito arriba (no normalizado);
// si el motor lo necesita normalizado por actividad, se hace en lectura. Slugs que no
// existan en `concepts` se reportan y se omiten (nunca inventamos FKs).
//
// Patrón de conexión idéntico a migrate.mjs / seed-concepts.mjs.
//
// Uso:
//   node scripts/db/backfill-activity-concepts.mjs            -> materializa Banda 1 (upsert)
//   node scripts/db/backfill-activity-concepts.mjs --dry-run  -> imprime plan, sin escribir
//   node scripts/db/backfill-activity-concepts.mjs --band 2
//   node scripts/db/backfill-activity-concepts.mjs --unit u1-1
//   node scripts/db/backfill-activity-concepts.mjs --prune    -> además borra filas obsoletas
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

function loadEnv() {
  try {
    const txt = readFileSync(join(repoRoot, '.env.local'), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* sin .env.local */ }
}
loadEnv();

const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!url) { console.error('ERROR: falta SUPABASE_DB_URL en .env.local'); process.exit(1); }

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const prune = argv.includes('--prune');
const getArg = (name, def) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] ? argv[i + 1] : def; };
const band = parseInt(getArg('--band', '1'), 10);
const unitExt = getArg('--unit', null);

const ssl = /sslmode=disable/.test(url) ? false : { rejectUnauthorized: false };
const { Client } = pg;
const client = new Client({ connectionString: url, ssl, connectionTimeoutMillis: 15000 });
client.on('error', (e) => { console.error('conexión:', e.message); });
await client.connect();

try {
  // slug → concept_id (catálogo cerrado).
  const slugToId = new Map(
    (await client.query('select id, slug from public.concepts')).rows.map((r) => [r.slug, r.id])
  );
  if (!slugToId.size) { console.error('ERROR: catálogo `concepts` vacío (corre seed-concepts.mjs).'); await client.end(); process.exit(1); }

  const params = [band];
  let where = 'l.band = $1';
  if (unitExt) { params.push(unitExt); where += ` and u.external_id = $${params.length}`; }
  const acts = (await client.query(
    `select a.id, a.content
       from public.activities a
       join public.units  u on u.id = a.unit_id
       join public.levels l on l.id = u.level_id
      where ${where}
        and a.content ? 'exercises'
      order by u.order_index, a.order_index`,
    params
  )).rows;

  if (!acts.length) { console.log(`Sin actividades en banda ${band}${unitExt ? ` / ${unitExt}` : ''}.`); await client.end(); process.exit(0); }

  // Acumula pesos por actividad.
  const plan = []; // { activityId, rows: [{slug, conceptId, weight}] }
  const missingSlugs = new Set();
  let totalRows = 0;

  for (const a of acts) {
    const exercises = Array.isArray(a.content?.exercises) ? a.content.exercises : [];
    const weights = new Map(); // slug -> weight
    for (const ex of exercises) {
      const meta = ex?.meta || {};
      const primary = typeof meta.conceptId === 'string' ? meta.conceptId : null;
      const ids = Array.isArray(meta.conceptIds) ? meta.conceptIds : (primary ? [primary] : []);
      if (primary) weights.set(primary, (weights.get(primary) || 0) + 1.0);
      for (const s of ids) {
        if (s === primary) continue;
        if (typeof s === 'string') weights.set(s, (weights.get(s) || 0) + 0.5);
      }
    }
    const rows = [];
    for (const [slug, w] of weights.entries()) {
      const conceptId = slugToId.get(slug);
      if (!conceptId) { missingSlugs.add(slug); continue; }
      rows.push({ slug, conceptId, weight: Math.round(w * 100) / 100 });
    }
    if (rows.length) { plan.push({ activityId: a.id, rows }); totalRows += rows.length; }
  }

  console.log(`\n=== activity_concepts (banda ${band}${unitExt ? ` / ${unitExt}` : ''}) ===`);
  console.log(`Actividades con conceptos: ${plan.length}/${acts.length} · filas a upsert: ${totalRows}.`);
  if (missingSlugs.size) console.log(`⚠ slugs sin concepto en catálogo (omitidos): ${[...missingSlugs].join(', ')}`);
  if (!totalRows) { console.log('Nada que materializar (¿corriste tag-exercises.mjs?).'); }

  if (dryRun) {
    for (const p of plan) console.log(`  act ${p.activityId}: ${p.rows.map((r) => `${r.slug}=${r.weight}`).join(', ')}`);
    console.log('\n[dry-run] No se escribió nada.');
    await client.end();
    process.exit(0);
  }

  await client.query('begin');
  for (const p of plan) {
    if (prune) {
      const keep = p.rows.map((r) => r.conceptId);
      await client.query(
        'delete from public.activity_concepts where activity_id = $1 and not (concept_id = any($2::uuid[]))',
        [p.activityId, keep]
      );
    }
    for (const r of p.rows) {
      await client.query(
        `insert into public.activity_concepts (activity_id, concept_id, weight)
         values ($1, $2, $3)
         on conflict (activity_id, concept_id) do update set weight = excluded.weight`,
        [p.activityId, r.conceptId, r.weight]
      );
    }
  }
  await client.query('commit');
  console.log(`\nListo. ${totalRows} fila(s) de activity_concepts materializada(s)${prune ? ' (+ prune de obsoletas)' : ''}.`);
} catch (e) {
  try { await client.query('rollback'); } catch {}
  console.error(`FAIL: ${e.message}`);
  await client.end();
  process.exit(1);
}
await client.end();
