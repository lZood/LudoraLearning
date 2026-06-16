// Agrega a cada unidad una 7ª actividad "Repaso" (actividad simple, mixed:true): un juego
// match_madness + una mezcla de ejercicios variados de la unidad. Idempotente.
// Uso: node scripts/db/seed-simple-activities.mjs
import pg from 'pg';
import { readFileSync } from 'node:fs';

const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);
const src = JSON.parse(readFileSync('./scripts/db/data/_unit-source.json', 'utf8'));
const EXTRA = {
  'u1-1': [{ en: 'Hello', es: 'Hola' }, { en: 'Bye', es: 'Adiós' }, { en: 'Thank you', es: 'Gracias' }, { en: 'Hi', es: 'Hola' }, { en: 'Good morning', es: 'Buenos días' }, { en: 'Yes', es: 'Sí' }],
  'u1-2': [{ en: 'Red', es: 'Rojo' }, { en: 'Blue', es: 'Azul' }, { en: 'Green', es: 'Verde' }, { en: 'Yellow', es: 'Amarillo' }, { en: 'Black', es: 'Negro' }, { en: 'White', es: 'Blanco' }],
};
const vocabOf = (ext) => (src[ext]?.vocab) || EXTRA[ext] || [];

const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
const units = (await c.query("select id, external_id from public.units order by order_index")).rows;
let added = 0;
for (const u of units) {
  const acts = (await c.query("select skill, content, order_index from public.activities where unit_id=$1 and type='lesson' and skill <> 'simple' order by order_index", [u.id])).rows;
  if (!acts.length) continue;

  // Pool de pares para el juego (de los match_pairs de la unidad + vocab fuente).
  const pairs = []; const seen = new Set();
  for (const a of acts) for (const ex of (a.content.exercises || [])) if (ex.type === 'match_pairs') for (const p of (ex.pairs || [])) { const k = (p.en || '').toLowerCase(); if (k && !seen.has(k)) { seen.add(k); pairs.push({ en: p.en, es: p.es }); } }
  if (pairs.length < 5) for (const v of vocabOf(u.external_id)) { const k = (v.en || '').toLowerCase(); if (k && !seen.has(k) && v.en.split(' ').length <= 2) { seen.add(k); pairs.push({ en: v.en, es: v.es }); } }
  const pool = pairs.slice(0, 8);

  // Mezcla variada (un ejercicio por tipo, round-robin), sin tipos pesados.
  const byType = {};
  for (const a of acts) for (const ex of (a.content.exercises || [])) {
    if (['reading_passage', 'conversation', 'match_madness'].includes(ex.type)) continue;
    (byType[ex.type] ||= []).push(ex);
  }
  const types = Object.keys(byType);
  const picked = [];
  let i = 0;
  while (picked.length < 6 && types.some((t) => byType[t].length)) { const t = types[i % types.length]; if (byType[t].length) picked.push(byType[t].shift()); if (++i > 60) break; }

  const exercises = [];
  if (pool.length >= 4) exercises.push({ type: 'match_madness', instruction: '¡Empareja contra reloj!', pool, seconds: 60 });
  exercises.push(...picked);
  if (!exercises.length) continue;

  await c.query("delete from public.activities where unit_id=$1 and skill='simple'", [u.id]);
  const maxOrder = Math.max(0, ...acts.map((a) => a.order_index || 0));
  await c.query(
    `insert into public.activities(unit_id, type, skill, title, order_index, xp_reward, content)
     values($1,'lesson','simple','Repaso',$2,30,$3::jsonb)`,
    [u.id, maxOrder + 1, JSON.stringify({ kind: 'lesson', skill: 'simple', mixed: true, exercises })]
  );
  added++;
}
await c.end();
console.log(`Actividad "Repaso" (simple) agregada en ${added} unidades.`);
