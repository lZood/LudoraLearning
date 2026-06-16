// Lee los JSON generados en scripts/db/data/gen/*.json, valida cada leccion/ejercicio
// contra el esquema de lessonContent.ts y reemplaza las actividades de cada unidad por
// sus 5 lecciones por destreza. Reporta unidades faltantes/invalidas.
// Uso: node scripts/db/seed-all-generated.mjs
import pg from 'pg';
import { readFileSync, readdirSync } from 'node:fs';

const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);
const SKILLS = ['listening', 'reading', 'writing', 'speaking', 'pronunciation', 'conversation'];
const WHITELIST = {
  listening: ['audio_mc', 'who_said_it', 'listen_build', 'listen_missing_word', 'tap_pairs_audio'],
  reading: ['text_mc', 'match_pairs', 'multi_select', 'reading_passage'],
  writing: ['word_bank', 'fill_blank', 'free_text'],
  speaking: ['speak', 'speak_repeat', 'speak_answer'],
  pronunciation: ['multi_select', 'speak', 'minimal_pairs'],
  conversation: ['conversation'],
};
const isStr = (x) => typeof x === 'string' && x.trim().length > 0;
const inRange = (i, arr) => Number.isInteger(i) && i >= 0 && Array.isArray(arr) && i < arr.length;

function validateExercise(e) {
  if (!e || typeof e !== 'object') return 'ejercicio no es objeto';
  switch (e.type) {
    case 'audio_mc':
      if (!isStr(e.audio)) return 'audio_mc.audio';
      if (!Array.isArray(e.options) || e.options.length < 2 || !e.options.every(isStr)) return 'audio_mc.options';
      if (!inRange(e.correct, e.options)) return 'audio_mc.correct';
      return null;
    case 'who_said_it':
      if (!isStr(e.target)) return 'who_said_it.target';
      if (!Array.isArray(e.options) || e.options.length < 2 || !e.options.every(isStr)) return 'who_said_it.options';
      if (!inRange(e.correct, e.options)) return 'who_said_it.correct';
      return null;
    case 'text_mc':
      if (!isStr(e.prompt)) return 'text_mc.prompt';
      if (!Array.isArray(e.options) || e.options.length < 2 || !e.options.every(isStr)) return 'text_mc.options';
      if (!inRange(e.correct, e.options)) return 'text_mc.correct';
      return null;
    case 'match_pairs':
      if (!Array.isArray(e.pairs) || e.pairs.length < 2 || !e.pairs.every((p) => p && isStr(p.en) && isStr(p.es))) return 'match_pairs.pairs';
      return null;
    case 'multi_select':
      if (!Array.isArray(e.options) || e.options.length < 2 || !e.options.every((o) => o && isStr(o.text) && typeof o.correct === 'boolean')) return 'multi_select.options';
      if (!e.options.some((o) => o.correct)) return 'multi_select sin opcion correcta';
      return null;
    case 'word_bank':
      if (!Array.isArray(e.answer) || e.answer.length < 2 || !e.answer.every(isStr)) return 'word_bank.answer';
      return null;
    case 'fill_blank':
      if (typeof e.before !== 'string' || typeof e.after !== 'string') return 'fill_blank.before/after';
      if (!Array.isArray(e.options) || e.options.length < 2 || !e.options.every(isStr)) return 'fill_blank.options';
      if (!inRange(e.correct, e.options)) return 'fill_blank.correct';
      return null;
    case 'free_text':
      if (!isStr(e.prompt)) return 'free_text.prompt';
      if (!Array.isArray(e.accept) || e.accept.length < 1 || !e.accept.every(isStr)) return 'free_text.accept';
      return null;
    case 'speak':
      if (!isStr(e.say)) return 'speak.say';
      return null;
    case 'listen_build':
      if (!isStr(e.audio)) return 'listen_build.audio';
      if (!Array.isArray(e.answer) || e.answer.length < 2 || !e.answer.every(isStr)) return 'listen_build.answer';
      return null;
    case 'listen_missing_word':
      if (!isStr(e.audio)) return 'listen_missing_word.audio';
      if (!Array.isArray(e.options) || e.options.length < 2 || !e.options.every(isStr)) return 'listen_missing_word.options';
      if (!inRange(e.correct, e.options)) return 'listen_missing_word.correct';
      return null;
    case 'tap_pairs_audio':
      if (!Array.isArray(e.pairs) || e.pairs.length < 2 || !e.pairs.every((p) => p && isStr(p.audio) && isStr(p.word))) return 'tap_pairs_audio.pairs';
      return null;
    case 'minimal_pairs':
      if (!isStr(e.audio)) return 'minimal_pairs.audio';
      if (!Array.isArray(e.options) || e.options.length < 2 || !e.options.every(isStr)) return 'minimal_pairs.options';
      if (!inRange(e.correct, e.options)) return 'minimal_pairs.correct';
      return null;
    case 'speak_repeat':
      if (!isStr(e.say)) return 'speak_repeat.say';
      return null;
    case 'speak_answer':
      if (!isStr(e.question)) return 'speak_answer.question';
      if (!Array.isArray(e.accept) || e.accept.length < 1 || !e.accept.every(isStr)) return 'speak_answer.accept';
      return null;
    case 'reading_passage': {
      if (!Array.isArray(e.sentences) || e.sentences.length < 1 || !e.sentences.every((s) => s && Number.isInteger(s.id) && isStr(s.text))) return 'reading_passage.sentences';
      if (!Array.isArray(e.questions) || e.questions.length < 1) return 'reading_passage.questions';
      const ids = new Set(e.sentences.map((s) => s.id));
      const gapIds = new Set(e.sentences.filter((s) => s.gapId != null).map((s) => s.gapId));
      for (const q of e.questions) {
        if (q.kind === 'cloze') {
          if (!gapIds.has(q.gapId)) return 'reading_passage cloze.gapId sin oración';
          if (!Array.isArray(q.options) || !inRange(q.correct, q.options)) return 'reading_passage cloze.options/correct';
        } else if (q.kind === 'insert_sentence') {
          if (!Array.isArray(q.options) || !inRange(q.correct, q.options)) return 'reading_passage insert.options/correct';
        } else if (q.kind === 'highlight') {
          if (!ids.has(q.correctSentenceId) || !isStr(q.prompt)) return 'reading_passage highlight';
        } else if (q.kind === 'main_idea' || q.kind === 'title') {
          if (!Array.isArray(q.options) || !inRange(q.correct, q.options)) return 'reading_passage ' + q.kind;
        } else return 'reading_passage pregunta kind desconocido: ' + q.kind;
      }
      return null;
    }
    case 'conversation':
      if (!isStr(e.scenario) || !isStr(e.objective) || !isStr(e.starter)) return 'conversation campos';
      return null;
    default:
      return 'tipo desconocido: ' + e.type;
  }
}

function validateUnit(data) {
  if (!data || !isStr(data.ext)) return 'falta ext';
  if (!Array.isArray(data.lessons) || data.lessons.length !== 6) return 'deben ser 6 lecciones';
  const skills = new Set();
  for (const l of data.lessons) {
    if (!SKILLS.includes(l.skill)) return 'skill invalido: ' + l.skill;
    skills.add(l.skill);
    if (!isStr(l.title)) return l.skill + ': falta title';
    if (!Array.isArray(l.exercises) || l.exercises.length < 1) return l.skill + ': sin ejercicios';
    for (let i = 0; i < l.exercises.length; i++) {
      const e = l.exercises[i];
      const err = validateExercise(e);
      if (err) return l.skill + '.ej[' + i + ']: ' + err;
      // Pureza: el tipo debe pertenecer a la destreza (salvo lección mixta).
      if (!data.mixed && !l.mixed && e && !WHITELIST[l.skill].includes(e.type)) return `${l.skill}.ej[${i}]: tipo ${e.type} no permitido en ${l.skill}`;
    }
  }
  if (skills.size !== 6) return 'faltan destrezas (debe haber las 6, incluida conversation)';
  return null;
}

const XP = { listening: 20, reading: 25, writing: 20, speaking: 25, pronunciation: 20, conversation: 25 };

const dir = './scripts/db/data/gen';
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const valid = [];
const bad = [];
for (const f of files) {
  let data;
  try { data = JSON.parse(readFileSync(dir + '/' + f, 'utf8')); } catch (e) { bad.push([f, 'JSON invalido: ' + e.message]); continue; }
  const err = validateUnit(data);
  if (err) { bad.push([f, err]); continue; }
  valid.push(data);
}

console.log(`Archivos: ${files.length} | válidos: ${valid.length} | inválidos: ${bad.length}`);
if (bad.length) { console.log('INVALIDOS:'); for (const [f, e] of bad) console.log(`  - ${f}: ${e}`); }

if (process.argv.includes('--dry')) { console.log('(dry run, sin escribir BD)'); process.exit(0); }

const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
const seeded = [];
const missing = [];
for (const data of valid) {
  await c.query('begin');
  try {
    const u = await c.query('select id from public.units where external_id=$1', [data.ext]);
    if (!u.rows.length) { await c.query('rollback'); missing.push(data.ext); continue; }
    const unitId = u.rows[0].id;
    await c.query('delete from public.activities where unit_id=$1', [unitId]);
    let i = 0;
    for (const l of data.lessons) {
      await c.query(
        `insert into public.activities(unit_id, type, skill, title, order_index, xp_reward, content)
         values($1,'lesson',$2,$3,$4,$5,$6::jsonb)`,
        [unitId, l.skill, l.title, ++i, l.xp || XP[l.skill] || 15, JSON.stringify({ kind: 'lesson', skill: l.skill, exercises: l.exercises })]
      );
    }
    await c.query('commit');
    seeded.push(data.ext);
  } catch (e) {
    await c.query('rollback');
    bad.push([data.ext, 'DB: ' + e.message]);
  }
}
await c.end();
console.log(`\nSEMBRADAS: ${seeded.length} unidades`);
if (missing.length) console.log('Sin unit en BD:', missing.join(', '));
if (bad.length) { console.log('PENDIENTES de reintentar:'); for (const [f, e] of bad) console.log(`  - ${f}: ${e}`); }
