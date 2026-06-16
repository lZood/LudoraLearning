// Aplica los diálogos guiados generados: en cada lección de Conversación deja
// [dialogue (chat IG con 3 respuestas), conversation(mode:'voice') (llamada)].
// Uso: node scripts/db/seed-dialogues.mjs
import pg from 'pg';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);
const DIR = './scripts/db/data/dialogues';
const isStr = (x) => typeof x === 'string' && x.trim().length > 0;

function validDialogue(d) {
  if (!d || d.type !== 'dialogue' || !Array.isArray(d.turns) || d.turns.length < 1) return false;
  for (const t of d.turns) {
    if (!isStr(t.npc)) return false;
    if (!Array.isArray(t.options) || t.options.length < 2 || !t.options.every((o) => o && isStr(o.text) && typeof o.correct === 'boolean')) return false;
    if (!t.options.some((o) => o.correct)) return false;
  }
  return true;
}

if (!existsSync(DIR)) { console.error('No hay dir de diálogos'); process.exit(1); }
const byExt = {};
for (const f of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  try { const d = JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8')); if (d.ext && validDialogue(d.dialogue)) byExt[d.ext] = d.dialogue; } catch { /* skip */ }
}
console.log('diálogos válidos:', Object.keys(byExt).length);

const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
const rows = (await c.query("select a.id, a.content, u.external_id from public.activities a join public.units u on u.id=a.unit_id where a.type='lesson' and a.skill='conversation'")).rows;
let updated = 0, missing = 0;
for (const r of rows) {
  const dlg = byExt[r.external_id];
  if (!dlg) { missing++; continue; }
  const exs = r.content?.exercises || [];
  let voice = exs.find((e) => e.type === 'conversation' && e.mode === 'voice') || exs.find((e) => e.type === 'conversation');
  if (voice) voice = { ...voice, mode: 'voice' };
  const content = { ...r.content, exercises: voice ? [dlg, voice] : [dlg] };
  await c.query('update public.activities set content=$1::jsonb where id=$2', [JSON.stringify(content), r.id]);
  updated++;
}
await c.end();
console.log(`Lecciones de conversación actualizadas: ${updated} | sin diálogo: ${missing}`);
