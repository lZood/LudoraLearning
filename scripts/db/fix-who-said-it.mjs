// Corrige los ejercicios "who_said_it": reemplaza distractores homófonos/gibberish
// (Bai/Buy/Bye...) por PALABRAS REALES DISTINGUIBLES tomadas del vocabulario de la
// misma unidad, garantizando que el índice correcto apunte al target. Actualiza la BD
// EN SITIO (preserva IDs/progreso) y reescribe los gen/*.json. Uso: node scripts/db/fix-who-said-it.mjs
import pg from 'pg';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);
const GEN = './scripts/db/data/gen';

const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'of', 'it', 'in', 'on', 'and', 'you', 'i', 'my', 'your', 'am', 'do', 'this', 'that', 'was', 'were', 'be', 'he', 'she', 'we', 'they']);
const GLOBAL = ['Hello', 'Goodbye', 'Please', 'Yes', 'No', 'Water', 'House', 'Apple', 'Friend', 'Dog', 'Cat', 'Tree', 'Book', 'Red', 'Blue', 'Green', 'One', 'Two', 'Run', 'Jump', 'Eat', 'Open', 'Close', 'Help', 'Name'];

const norm = (s) => String(s).trim().toLowerCase().replace(/[^\p{L}\s']/gu, '').trim();
const clean = (s) => String(s).trim().replace(/[.,!?;:]+$/g, '').trim();
const words = (s) => clean(s).split(/\s+/).length;
function lev(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => { const r = new Array(n + 1).fill(0); r[0] = i; return r; });
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
const distinct = (a, b) => norm(a) !== norm(b) && lev(norm(a), norm(b)) >= 3; // sonoramente diferentes
function shuffle(a) { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

// Construye un pool de palabras reales y cortas a partir del contenido de la unidad.
function buildPool(lessons) {
  const pool = new Map(); // norm -> original limpio
  const add = (s) => {
    const c = clean(s);
    if (!c) return;
    if (words(c) > 2) return;            // solo palabras/expresiones cortas
    if (!/[a-zA-Z]/.test(c)) return;
    if (STOP.has(norm(c))) return;
    if (norm(c).length < 2) return;
    if (!pool.has(norm(c))) pool.set(norm(c), c);
  };
  for (const l of lessons) for (const e of l.exercises) {
    if (e.type === 'match_pairs') (e.pairs || []).forEach((p) => add(p.en));
    else if (e.type === 'multi_select') (e.options || []).forEach((o) => add(o.text));
    else if (e.type === 'who_said_it') add(e.target);
    else if (e.type === 'fill_blank') (e.options || []).forEach(add);
    else if (e.type === 'audio_mc' && words(e.audio) <= 2) add(e.audio);
    else if (e.type === 'speak' && words(e.say) <= 2) add(e.say);
  }
  return [...pool.values()];
}

function pickDistractors(target, pool) {
  const chosen = [];
  const tryAdd = (w) => {
    if (chosen.length >= 3) return;
    if (!distinct(w, target)) return;
    if (chosen.some((c) => !distinct(w, c))) return; // distinto también entre distractores
    chosen.push(clean(w));
  };
  for (const w of shuffle(pool)) tryAdd(w);
  for (const w of shuffle(GLOBAL)) tryAdd(w);
  // último recurso: rellenar con globales aunque compartan poca distancia entre sí
  for (const w of GLOBAL) { if (chosen.length >= 3) break; if (distinct(w, target) && !chosen.some((c) => norm(c) === norm(w))) chosen.push(w); }
  return chosen.slice(0, 3);
}

let fixed = 0, units = 0;
const perUnit = {}; // ext -> lessons (transformados)
for (const f of readdirSync(GEN)) {
  if (!f.endsWith('.json')) continue;
  const d = JSON.parse(readFileSync(`${GEN}/${f}`, 'utf8'));
  const pool = buildPool(d.lessons);
  let touched = false;
  for (const l of d.lessons) for (const e of l.exercises) {
    if (e.type !== 'who_said_it') continue;
    const target = clean(e.target);
    const distractors = pickDistractors(target, pool);
    const opts = shuffle([target, ...distractors]);
    e.target = target;
    e.options = opts;
    e.correct = opts.findIndex((o) => norm(o) === norm(target));
    fixed++; touched = true;
  }
  if (touched) { writeFileSync(`${GEN}/${f}`, JSON.stringify(d)); units++; }
  perUnit[d.ext] = d.lessons;
}
console.log(`who_said_it corregidos: ${fixed} en ${units} unidades`);

// Actualiza la BD EN SITIO (por unidad+skill), preservando IDs de actividad.
const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
let updated = 0;
for (const [ext, lessons] of Object.entries(perUnit)) {
  const u = await c.query('select id from public.units where external_id=$1', [ext]);
  if (!u.rows.length) continue;
  for (const l of lessons) {
    const res = await c.query(
      `update public.activities set content=$1::jsonb where unit_id=$2 and skill=$3 and type='lesson'`,
      [JSON.stringify({ kind: 'lesson', skill: l.skill, exercises: l.exercises }), u.rows[0].id, l.skill]
    );
    updated += res.rowCount;
  }
}
await c.end();
console.log(`Actividades actualizadas en BD: ${updated}`);
