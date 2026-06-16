// Aplica el contenido generado por el workflow a activities.content.
// Uso: node scripts/db/seed-generated-content.mjs <ruta-al-output.json>
// El archivo es el output del workflow: { result: [{ unitExt, content: { theory, exercise, audio, chat, midterm, final } }, ...] }
import pg from 'pg';
import { readFileSync } from 'node:fs';

const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);
const file = process.argv[2];
if (!file) { console.error('uso: node scripts/db/seed-generated-content.mjs <output.json>'); process.exit(1); }

const raw = JSON.parse(readFileSync(file, 'utf8'));
const items = Array.isArray(raw) ? raw : (raw.result ?? raw.results ?? []);
if (!Array.isArray(items) || !items.length) { console.error('No encontré items en el archivo.'); process.exit(1); }

const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
await c.query('begin');
let units = 0, acts = 0, skipped = 0;
try {
  for (const it of items) {
    const unitExt = it.unitExt;
    const content = it.content;
    if (!unitExt || !content) { skipped++; continue; }
    units++;
    for (const [type, body] of Object.entries(content)) {
      if (!body) continue;
      const r = await c.query(
        `update public.activities a set content = $1::jsonb
         from public.units u
         where a.unit_id = u.id and u.external_id = $2 and a.type = $3`,
        [JSON.stringify(body), unitExt, type]
      );
      acts += r.rowCount ?? 0;
    }
  }
  await c.query('commit');
  console.log(`OK: ${units} unidades, ${acts} actividades con contenido. (saltadas: ${skipped})`);
} catch (e) {
  await c.query('rollback');
  console.error('FAIL:', e.message);
  process.exitCode = 1;
}
await c.end();
