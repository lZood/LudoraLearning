// Runner de migraciones idempotente para el Supabase self-hosted.
// Lee SUPABASE_DB_URL de .env.local, registra lo aplicado en public.schema_migrations
// y aplica en orden los .sql de supabase/migrations que falten.
//
// Uso:
//   node scripts/db/migrate.mjs            -> aplica todas las pendientes
//   node scripts/db/migrate.mjs 0001_foundations.sql  -> aplica solo ese archivo
//   node scripts/db/migrate.mjs --status   -> lista aplicadas vs pendientes
import pg from 'pg';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const migrationsDir = join(repoRoot, 'supabase', 'migrations');

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

const ssl = /sslmode=disable/.test(url) ? false : { rejectUnauthorized: false };
const arg = process.argv[2];

const { Client } = pg;
const client = new Client({ connectionString: url, ssl, connectionTimeoutMillis: 15000 });
client.on('error', (e) => { console.error('conexión:', e.message); });
await client.connect();

await client.query(
  `create table if not exists public.schema_migrations (
     version text primary key,
     applied_at timestamptz not null default now()
   )`
);
const applied = new Set(
  (await client.query('select version from public.schema_migrations')).rows.map((r) => r.version)
);
const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

if (arg === '--status') {
  for (const f of files) console.log(`${applied.has(f) ? '[x]' : '[ ]'} ${f}`);
  await client.end();
  process.exit(0);
}

let count = 0;
for (const f of files) {
  if (arg && !arg.startsWith('--') && f !== arg) continue;
  if (applied.has(f)) { console.log(`= skip   ${f}`); continue; }
  const sql = readFileSync(join(migrationsDir, f), 'utf8');
  process.stdout.write(`> apply  ${f} ... `);
  try {
    await client.query('begin');
    await client.query(sql);
    await client.query('insert into public.schema_migrations(version) values ($1)', [f]);
    await client.query('commit');
    console.log('OK');
    count++;
  } catch (e) {
    try { await client.query('rollback'); } catch {}
    console.error(`FAIL\n  ${e.message}`);
    await client.end();
    process.exit(1);
  }
}
console.log(`\nListo. ${count} migración(es) aplicada(s).`);
await client.end();
