// Siembra el prior de dominio por concepto (user_concept_mastery) para usuarios YA existentes
// que tienen una evaluación diagnóstica (Master Plan §3.4 / §7 · fase F2 · T2.4 backfill).
//
// El cold-start del plan dice: por cada concepto de la destreza S, theta_inicial = theta_destreza(S)
// con shrinkage a la banda. La fuente canónica es la RPC `backfill_mastery_from_diagnostic(p_user)`
// (definida en la migración 0031). Este script:
//   1) PREFIERE llamar a la RPC por usuario (un único camino de escritura, server-authoritative).
//   2) Si la RPC AÚN NO existe en el entorno (0031 sin aplicar) → FALLA SUAVE con un mensaje claro
//      y sale 0 (no es error: F2.T2.4 todavía no se desplegó). Con --replicate intenta sembrar
//      en JS (solo si la tabla user_concept_mastery existe), como puente hasta tener la RPC.
//
// Idempotente: la RPC debe serlo (PK user,concept); la réplica JS hace ON CONFLICT DO NOTHING
// (no pisa maestría ya aprendida). --dry-run no escribe.
//
// SUPUESTOS de la réplica JS (documentados porque hoy NO hay theta por-destreza persistida —
// evaluations.category_levels solo guarda { cefr, theta GLOBAL, band }):
//   - theta de partida = theta GLOBAL del placement (o el centro de la banda si falta).
//   - shrinkage hacia el centro de la banda: theta_init = W*theta + (1-W)*centro, W=0.6 (def),
//     centro = difOf(band) = 1 + (band-1)*5/7  (inversa de thetaToBand en src/lib/diagnostic.ts).
//   - se siembran TODOS los conceptos del catálogo presentes (hoy solo Banda 1).
//   La RPC oficial debe refinar esto con theta POR DESTREZA cuando exista esa señal.
//
// Patrón de conexión idéntico a migrate.mjs / seed-concepts.mjs.
//
// Uso:
//   node scripts/db/backfill-user-mastery.mjs              -> vía RPC (o falla suave si no existe)
//   node scripts/db/backfill-user-mastery.mjs --dry-run    -> imprime plan, sin escribir
//   node scripts/db/backfill-user-mastery.mjs --replicate  -> réplica JS si falta la RPC (y existe la tabla)
//   node scripts/db/backfill-user-mastery.mjs --shrink 0.6 -> factor de shrinkage de la réplica
//   node scripts/db/backfill-user-mastery.mjs --limit 100  -> tope de usuarios (pruebas)
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
const replicate = argv.includes('--replicate');
const getArg = (name, def) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] ? argv[i + 1] : def; };
const shrinkW = Math.max(0, Math.min(1, parseFloat(getArg('--shrink', '0.6'))));
const limit = parseInt(getArg('--limit', '0'), 10);

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
// Inversa aproximada de thetaToBand (src/lib/diagnostic.ts): difOf(band)=1+(band-1)*5/7.
const bandCenter = (band) => clamp(1 + (clamp(band, 1, 8) - 1) * (5 / 7), 1, 6);

const ssl = /sslmode=disable/.test(url) ? false : { rejectUnauthorized: false };
const { Client } = pg;
const client = new Client({ connectionString: url, ssl, connectionTimeoutMillis: 15000 });
client.on('error', (e) => { console.error('conexión:', e.message); });
await client.connect();

try {
  // Detección de capacidades del entorno.
  const rpcExists = (await client.query(
    `select 1 from pg_proc where proname = 'backfill_mastery_from_diagnostic' limit 1`
  )).rowCount > 0;
  const tableExists = (await client.query(
    `select to_regclass('public.user_concept_mastery') is not null as ok`
  )).rows[0]?.ok === true;

  // Última evaluación completada por usuario (category_levels = { cefr, theta, band }).
  let q = `
    select distinct on (e.user_id) e.user_id, e.category_levels, u.english_level
      from public.evaluations e
      join public.users u on u.id = e.user_id
     order by e.user_id, e.created_at desc`;
  if (limit > 0) q = `select * from (${q}) s limit ${limit}`;
  const users = (await client.query(q)).rows;

  console.log(`\n=== backfill user_concept_mastery ===`);
  console.log(`Usuarios con evaluación: ${users.length}`);
  console.log(`RPC backfill_mastery_from_diagnostic: ${rpcExists ? 'presente' : 'AUSENTE'} · tabla user_concept_mastery: ${tableExists ? 'presente' : 'AUSENTE'}`);

  // ---- Camino 1: RPC oficial (preferido) ----
  if (rpcExists) {
    if (dryRun) { console.log(`\n[dry-run] Llamaría a la RPC para ${users.length} usuario(s).`); await client.end(); process.exit(0); }
    let ok = 0, fail = 0;
    for (const u of users) {
      try { await client.query('select public.backfill_mastery_from_diagnostic($1::uuid)', [u.user_id]); ok++; }
      catch (e) { fail++; console.error(`  ✗ ${u.user_id}: ${e.message}`); }
    }
    console.log(`\nListo (RPC). Sembrados: ${ok} · fallos: ${fail}.`);
    await client.end();
    process.exit(fail ? 1 : 0);
  }

  // ---- RPC ausente ----
  if (!replicate) {
    console.log(`\n[falla suave] La RPC backfill_mastery_from_diagnostic no existe todavía en este entorno.`);
    console.log(`  → Aplica la migración 0031 (fase F2.T2.1) y vuelve a correr este script, o`);
    console.log(`  → usa --replicate para sembrar en JS como puente (requiere la tabla user_concept_mastery).`);
    await client.end();
    process.exit(0); // soft: no es un error, F2.T2.1/T2.4 aún no desplegado.
  }

  // ---- Camino 2: réplica JS (--replicate) ----
  if (!tableExists) {
    console.log(`\n[falla suave] --replicate pedido, pero la tabla user_concept_mastery no existe (falta 0031).`);
    console.log(`  → Aplica la migración 0031 primero. No se escribió nada.`);
    await client.end();
    process.exit(0);
  }

  const concepts = (await client.query('select id, slug, difficulty from public.concepts')).rows;
  if (!concepts.length) { console.error('ERROR: catálogo `concepts` vacío.'); await client.end(); process.exit(1); }

  // Plan: por usuario, theta_init = shrink(thetaGlobal, centro(band)).
  let totalRows = 0;
  const plan = users.map((u) => {
    const cl = u.category_levels || {};
    let band = Number.isFinite(cl.band) ? cl.band : null;
    if (band == null) { const m = /(\d+)/.exec(u.english_level || ''); if (m) band = parseInt(m[1], 10); }
    band = clamp(band || 1, 1, 8);
    const theta = Number.isFinite(cl.theta) ? cl.theta : bandCenter(band);
    const thetaInit = Math.round(clamp(shrinkW * theta + (1 - shrinkW) * bandCenter(band), 1, 6) * 100) / 100;
    totalRows += concepts.length;
    return { userId: u.user_id, band, thetaInit };
  });

  console.log(`\nRéplica JS: ${users.length} usuario(s) × ${concepts.length} concepto(s) = ${totalRows} fila(s) (ON CONFLICT DO NOTHING).`);
  if (dryRun) {
    for (const p of plan.slice(0, 10)) console.log(`  ${p.userId}  band=${p.band}  theta_init=${p.thetaInit}`);
    if (plan.length > 10) console.log(`  … (+${plan.length - 10} usuarios)`);
    console.log('\n[dry-run] No se escribió nada.');
    await client.end();
    process.exit(0);
  }

  await client.query('begin');
  let inserted = 0;
  for (const p of plan) {
    for (const c of concepts) {
      // Solo siembra el prior; nunca pisa maestría ya aprendida (idempotente).
      const res = await client.query(
        `insert into public.user_concept_mastery (user_id, concept_id, theta)
         values ($1, $2, $3)
         on conflict (user_id, concept_id) do nothing`,
        [p.userId, c.id, p.thetaInit]
      );
      inserted += res.rowCount || 0;
    }
  }
  await client.query('commit');
  console.log(`\nListo (réplica JS). Filas nuevas: ${inserted} (las ya existentes se respetaron).`);
} catch (e) {
  try { await client.query('rollback'); } catch {}
  console.error(`FAIL: ${e.message}`);
  await client.end();
  process.exit(1);
}
await client.end();
