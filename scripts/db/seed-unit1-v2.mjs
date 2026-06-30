// Valida y SIEMBRA el contenido v2 de la Unidad 1 en activities.content_v2 (GATEADO).
// NO toca activities.content (live) ni content_version => prod sigue 100% v1 hasta el
// cutover F7. Lee un JSON {lessons:[{actId, skill, content}]} (salida del workflow F6).
//
// Uso:
//   node scripts/db/seed-unit1-v2.mjs <ruta.json>            -> valida + escribe content_v2
//   node scripts/db/seed-unit1-v2.mjs <ruta.json> --check    -> solo valida (no escribe)
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = 'C:/Users/jrami/OneDrive/Documentos/Desarrollo/LudoraLearning';
const fileArg = process.argv[2];
const checkOnly = process.argv.includes('--check');
if (!fileArg) { console.error('ERROR: pasa la ruta del JSON de lecciones'); process.exit(1); }

// ── Campos requeridos por tipo de ejercicio (espejo de src/lib/lessonContent.ts) ──
const REQUIRED = {
  text_mc: (e) => str(e.prompt) && arr(e.options) && num(e.correct),
  audio_mc: (e) => str(e.audio) && arr(e.options) && num(e.correct),
  who_said_it: (e) => str(e.target) && arr(e.options) && num(e.correct),
  listen_missing_word: (e) => str(e.audio) && arr(e.options) && num(e.correct),
  tap_pairs_audio: (e) => Array.isArray(e.pairs) && e.pairs.length >= 2 && e.pairs.every((p) => str(p.audio) && str(p.word)),
  match_pairs: (e) => Array.isArray(e.pairs) && e.pairs.length >= 2 && e.pairs.every((p) => str(p.en) && str(p.es)),
  multi_select: (e) => Array.isArray(e.options) && e.options.length >= 2 && e.options.every((o) => str(o.text) && typeof o.correct === 'boolean') && e.options.some((o) => o.correct),
  word_bank: (e) => arr1(e.answer),
  fill_blank: (e) => str(e.before) !== undefined && str(e.after) !== undefined && arr(e.options) && num(e.correct),
  free_text: (e) => str(e.prompt) && arr1(e.accept),
  speak: (e) => str(e.say),
  speak_repeat: (e) => str(e.say),
  speak_answer: (e) => str(e.question) && arr1(e.accept),
  minimal_pairs: (e) => str(e.audio) && arr(e.options) && num(e.correct),
  listen_build: (e) => str(e.audio) && arr1(e.answer),
  conversation: (e) => str(e.scenario) && str(e.objective) && str(e.starter),
  dialogue: (e) => Array.isArray(e.turns) && e.turns.length >= 2 && e.turns.every((t) => str(t.npc) && Array.isArray(t.options) && t.options.some((o) => o.correct)),
  reading_passage: (e) => Array.isArray(e.sentences) && Array.isArray(e.questions),
};
const str = (v) => typeof v === 'string' && v.length > 0;
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const arr = (v) => Array.isArray(v) && v.length >= 2 && v.every((x) => typeof x === 'string');
const arr1 = (v) => Array.isArray(v) && v.length >= 1 && v.every((x) => typeof x === 'string'); // ≥1 (accept/answer)

// Valida una leccion v2. Devuelve [] si OK, o lista de problemas.
function validate(content) {
  const errs = [];
  if (!content || typeof content !== 'object') return ['no es objeto'];
  if (content.kind !== 'lesson') errs.push("kind!='lesson'");
  if (!str(content.skill)) errs.push('skill faltante');
  if (content.contentVersion !== 2) errs.push('contentVersion!=2');
  const exs = content.exercises;
  if (!Array.isArray(exs) || exs.length < 6) { errs.push('exercises < 6'); return errs; }

  const present = content.present;
  if (!present || !Array.isArray(present.items)) errs.push('present.items faltante');
  else if (present.items.length < 3 || present.items.length > 5) errs.push(`present.items=${present.items.length} (debe 3-5)`);

  // Cobertura: cada conceptId del present aparece en meta de algun ejercicio.
  const covered = new Set();
  exs.forEach((e, i) => {
    const m = e.meta || {};
    if (m.conceptId) covered.add(m.conceptId);
    if (Array.isArray(m.conceptIds)) m.conceptIds.forEach((c) => covered.add(c));
    if (!m.conceptId) errs.push(`ex#${i} (${e.type}) sin meta.conceptId`);
    if (!['recognize', 'produce', 'apply'].includes(m.section)) errs.push(`ex#${i} section invalida: ${m.section}`);
    const chk = REQUIRED[e.type];
    if (!chk) errs.push(`ex#${i} tipo desconocido: ${e.type}`);
    else if (!chk(e)) errs.push(`ex#${i} (${e.type}) campos incompletos`);
  });
  for (const it of (present?.items || [])) {
    if (it.conceptId && !covered.has(it.conceptId)) errs.push(`present concepto sin practicar: ${it.conceptId}`);
  }
  // Secciones: al menos 1 de cada.
  for (const sec of ['recognize', 'produce', 'apply']) {
    if (!exs.some((e) => e.meta?.section === sec)) errs.push(`falta seccion '${sec}'`);
  }
  return errs;
}

const raw = JSON.parse(readFileSync(fileArg.startsWith('/') || /^[A-Za-z]:/.test(fileArg) ? fileArg : join(repoRoot, fileArg), 'utf8'));
const lessons = Array.isArray(raw) ? raw : (raw.lessons || []);
console.log(`Lecciones recibidas: ${lessons.length}\n`);

const ok = [];
for (const L of lessons) {
  const errs = validate(L.content);
  const nEx = L.content?.exercises?.length ?? 0;
  const nPr = L.content?.present?.items?.length ?? 0;
  if (errs.length === 0) {
    ok.push(L);
    console.log(`  ✅ ${L.skill.padEnd(14)} ${L.actId.slice(0, 8)}  present=${nPr} ex=${nEx}`);
  } else {
    console.log(`  ❌ ${L.skill.padEnd(14)} ${L.actId.slice(0, 8)}  ${errs.length} problema(s):`);
    for (const e of errs) console.log(`       - ${e}`);
  }
}
console.log(`\nVálidas: ${ok.length}/${lessons.length}`);

if (checkOnly) { console.log('(--check: no se escribe nada)'); process.exit(ok.length === lessons.length ? 0 : 1); }
if (ok.length === 0) { console.log('Nada que escribir.'); process.exit(1); }

// ── Escribe content_v2 (gateado). NO toca content ni content_version. ──
const txt = readFileSync(join(repoRoot, '.env.local'), 'utf8');
for (const line of txt.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
const ssl = /sslmode=disable/.test(url) ? false : { rejectUnauthorized: false };
const { Client } = pg;
const client = new Client({ connectionString: url, ssl, connectionTimeoutMillis: 15000 });
await client.connect();
let written = 0;
try {
  await client.query('begin');
  for (const L of ok) {
    const res = await client.query(
      'update public.activities set content_v2 = $2::jsonb where id = $1',
      [L.actId, JSON.stringify(L.content)]
    );
    written += res.rowCount;
  }
  await client.query('commit');
} catch (e) {
  try { await client.query('rollback'); } catch {}
  console.error('FAIL:', e.message);
  await client.end();
  process.exit(1);
}
console.log(`\nListo. content_v2 escrito en ${written} actividad(es) (content live INTACTO).`);
await client.end();
