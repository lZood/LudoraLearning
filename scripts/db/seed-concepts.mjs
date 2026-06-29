// Sembrador idempotente del catálogo de conceptos (menas/minerales del mundo Minecraft).
// Lee scripts/db/lib/concept-taxonomy.json y hace UPSERT en public.concepts por `slug`
// (ON CONFLICT (slug) DO UPDATE). Consistente con la migración 0028_concepts_catalog.sql.
// NO borra filas: solo inserta/actualiza, así que re-ejecutarlo es seguro.
//
// Patrón de conexión idéntico a scripts/db/migrate.mjs (carga .env.local, ssl según sslmode).
//
// Uso:
//   node scripts/db/seed-concepts.mjs           -> upsert de todos los conceptos
//   node scripts/db/seed-concepts.mjs --dry-run -> imprime el plan sin escribir
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const taxonomyPath = join(__dirname, 'lib', 'concept-taxonomy.json');

// Carga .env.local sin pisar variables ya presentes (igual que migrate.mjs).
function loadEnv() {
  try {
    const txt = readFileSync(join(repoRoot, '.env.local'), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch { /* sin .env.local */ }
}
loadEnv();

const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!url) { console.error('ERROR: falta SUPABASE_DB_URL en .env.local'); process.exit(1); }

const dryRun = process.argv.includes('--dry-run');

// --- Aplana la taxonomía (agrupada por destreza) a filas de `concepts`. ---
const tax = JSON.parse(readFileSync(taxonomyPath, 'utf8'));
const defaults = tax.defaults || {};
const rows = [];
for (const [skill, concepts] of Object.entries(tax.skills || {})) {
  for (const c of concepts) {
    if (!c.slug) { console.error(`ERROR: concepto sin slug en destreza '${skill}'`); process.exit(1); }
    rows.push({
      slug: c.slug,
      skill,
      kind: c.kind,
      label: c.label,
      cefr: c.cefr ?? defaults.cefr ?? 'A1',
      difficulty: c.difficulty,
      biome_key: c.biome_key ?? defaults.biome_key ?? null,
      mc_block_key: c.mc_block_key ?? null,
      order_index: rows.length, // orden global estable según aparición en el JSON
      minecraft: { block_key: c.mc_block_key ?? null, biome_key: c.biome_key ?? defaults.biome_key ?? null },
    });
  }
}

// Guardas de consistencia con el CHECK de kind y el rango de difficulty (0028).
const KINDS = new Set(['lemma', 'pattern', 'rule', 'phoneme', 'function']);
for (const r of rows) {
  if (!KINDS.has(r.kind)) { console.error(`ERROR: kind inválido '${r.kind}' en ${r.slug}`); process.exit(1); }
  if (typeof r.difficulty !== 'number' || r.difficulty < 1 || r.difficulty > 6) {
    console.error(`ERROR: difficulty fuera de rango (1–6) en ${r.slug}: ${r.difficulty}`); process.exit(1);
  }
}

const dupes = rows.map((r) => r.slug).filter((s, i, a) => a.indexOf(s) !== i);
if (dupes.length) { console.error(`ERROR: slugs duplicados: ${[...new Set(dupes)].join(', ')}`); process.exit(1); }

if (dryRun) {
  console.log(`[dry-run] ${rows.length} concepto(s) listos para upsert:`);
  for (const r of rows) console.log(`  ${r.skill.padEnd(12)} ${r.slug.padEnd(34)} diff=${r.difficulty} (${r.kind})`);
  process.exit(0);
}

const ssl = /sslmode=disable/.test(url) ? false : { rejectUnauthorized: false };
const { Client } = pg;
const client = new Client({ connectionString: url, ssl, connectionTimeoutMillis: 15000 });
client.on('error', (e) => { console.error('conexión:', e.message); });
await client.connect();

let inserted = 0, updated = 0;
try {
  await client.query('begin');
  for (const r of rows) {
    const res = await client.query(
      `insert into public.concepts
         (slug, skill, kind, label, cefr, difficulty, biome_key, mc_block_key, order_index, minecraft)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
       on conflict (slug) do update set
         skill        = excluded.skill,
         kind         = excluded.kind,
         label        = excluded.label,
         cefr         = excluded.cefr,
         difficulty   = excluded.difficulty,
         biome_key    = excluded.biome_key,
         mc_block_key = excluded.mc_block_key,
         order_index  = excluded.order_index,
         minecraft    = excluded.minecraft
       returning (xmax = 0) as is_insert`,
      [r.slug, r.skill, r.kind, r.label, r.cefr, r.difficulty, r.biome_key, r.mc_block_key, r.order_index, JSON.stringify(r.minecraft)]
    );
    if (res.rows[0]?.is_insert) inserted++; else updated++;
  }
  await client.query('commit');
} catch (e) {
  try { await client.query('rollback'); } catch {}
  console.error(`FAIL: ${e.message}`);
  await client.end();
  process.exit(1);
}

console.log(`Listo. Conceptos sembrados: ${inserted} nuevo(s), ${updated} actualizado(s) (${rows.length} total).`);
await client.end();
