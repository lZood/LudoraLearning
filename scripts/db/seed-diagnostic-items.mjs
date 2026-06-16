// Siembra public.diagnostic_items muestreando ejercicios auto-gradables de las lecciones
// (scripts/db/data/gen/*.json), etiquetados por destreza y dificultad (según la banda).
// Uso: node scripts/db/seed-diagnostic-items.mjs
import pg from 'pg';
import { readFileSync, readdirSync } from 'node:fs';

const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);
const GEN = './scripts/db/data/gen';

const SKILL_OF = {
  text_mc: 'reading', match_pairs: 'reading', multi_select: 'reading',
  audio_mc: 'listening', who_said_it: 'listening', listen_missing_word: 'listening', minimal_pairs: 'listening', tap_pairs_audio: 'listening',
  word_bank: 'writing', fill_blank: 'writing', listen_build: 'writing',
  speak: 'speaking', speak_repeat: 'speaking', speak_answer: 'speaking',
};
const cefrOf = (band) => band <= 2 ? 'A1' : band <= 4 ? 'A2' : band <= 6 ? 'B1' : 'B2';
const diffOf = (band) => Math.round((1.0 + (band - 1) * (5.0 / 7)) * 100) / 100; // banda1=1.0 .. banda8=6.0
const jitter = () => (Math.random() - 0.5) * 0.4; // ±0.2
const CAP_PER_GROUP = 8; // por (banda, destreza)
function shuffle(a) { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

// Recolecta candidatos por (band, skill).
const groups = new Map(); // `${band}|${skill}` -> [{type, content}]
for (const f of readdirSync(GEN)) {
  if (!f.endsWith('.json')) continue;
  const d = JSON.parse(readFileSync(`${GEN}/${f}`, 'utf8'));
  const band = parseInt((d.ext.match(/u(\d+)-/) || [])[1] || '0', 10);
  if (!band) continue;
  for (const l of d.lessons || []) for (const e of l.exercises || []) {
    const skill = SKILL_OF[e.type];
    if (!skill) continue;
    const key = `${band}|${skill}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ type: e.type, content: e });
  }
}

const items = [];
for (const [key, arr] of groups) {
  const [band, skill] = key.split('|');
  const picked = shuffle(arr).slice(0, CAP_PER_GROUP);
  for (const it of picked) {
    items.push({ skill, difficulty: Math.max(1, Math.min(6, diffOf(+band) + jitter())), cefr: cefrOf(+band), type: it.type, content: it.content });
  }
}

const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
await c.query('begin');
try {
  await c.query('delete from public.diagnostic_items');
  for (const it of items) {
    await c.query(
      'insert into public.diagnostic_items(skill, difficulty, cefr, type, content) values($1,$2,$3,$4,$5::jsonb)',
      [it.skill, it.difficulty, it.cefr, it.type, JSON.stringify(it.content)]
    );
  }
  await c.query('commit');
} catch (e) { await c.query('rollback'); console.error('FAIL:', e.message); process.exitCode = 1; }
// Resumen
const byBand = await c.query("select cefr, skill, count(*) n, round(min(difficulty)::numeric,2) lo, round(max(difficulty)::numeric,2) hi from public.diagnostic_items group by cefr, skill order by cefr, skill");
console.log(`Sembrados ${items.length} ítems diagnósticos.`);
for (const r of byBand.rows) console.log(`  ${r.cefr} ${r.skill}: ${r.n} (diff ${r.lo}-${r.hi})`);
await c.end();
