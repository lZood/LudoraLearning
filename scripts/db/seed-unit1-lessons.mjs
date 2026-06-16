// Reemplaza las actividades de la Unidad 1 (u1-1) por 5 lecciones por destreza
// estilo Duolingo, con los 14 ejercicios del spec. Uso: node scripts/db/seed-unit1-lessons.mjs
import pg from 'pg';
import { readFileSync } from 'node:fs';
const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);

const lessons = [
  { skill: 'listening', title: 'Listening', xp: 15, exercises: [
    { type: 'audio_mc', instruction: 'Escucha y elige', audio: 'Hello!', options: ['Hola', 'Adiós', 'Gracias'], correct: 0 },
    { type: 'who_said_it', target: 'Hi', options: ['Hello', 'Hi', 'Ai', 'Ei'], correct: 1 },
    { type: 'audio_mc', instruction: 'Completa la conversación', audio: 'How are you?', prompt: 'Elige la respuesta correcta', options: ["I'm good.", 'Goodbye.', 'My name is Alex.'], correct: 0 },
  ] },
  { skill: 'reading', title: 'Reading', xp: 15, exercises: [
    { type: 'match_pairs', instruction: 'Une cada palabra con su significado', pairs: [{ en: 'Hello', es: 'Hola' }, { en: 'Bye', es: 'Adiós' }, { en: 'Nice to meet you', es: 'Mucho gusto' }, { en: 'My name is', es: 'Me llamo' }] },
    { type: 'text_mc', instruction: 'Lee y elige', prompt: 'What is your name?', options: ['¿Cómo te llamas?', '¿Cómo estás?', '¿Qué color es?'], correct: 0 },
    { type: 'multi_select', instruction: 'Selecciona solo los saludos', options: [{ text: 'Hello', correct: true }, { text: 'Hi', correct: true }, { text: 'Pig', correct: false }, { text: 'Red', correct: false }, { text: 'Hey', correct: true }, { text: 'Bye', correct: false }] },
  ] },
  { skill: 'writing', title: 'Writing', xp: 15, exercises: [
    { type: 'word_bank', instruction: 'Ordena la oración', prompt: 'Me llamo Alex.', answer: ['My', 'name', 'is', 'Alex.'] },
    { type: 'fill_blank', instruction: 'Completa la palabra que falta', before: 'My', after: 'is Steve.', options: ['name', 'blue', 'pig'], correct: 0 },
    { type: 'free_text', instruction: 'Preséntate', prompt: 'What is your name? — My name is ______', accept: ['my name is', 'i am', 'name is'] },
  ] },
  { skill: 'speaking', title: 'Speaking', xp: 20, exercises: [
    { type: 'speak', instruction: 'Repite después del personaje', say: 'Hello Steve', prompt: 'Escucha y repítelo.' },
    { type: 'speak', instruction: 'Di tu nombre', say: 'My name is...', prompt: 'Di: My name is (tu nombre).' },
    { type: 'conversation', instruction: 'Pequeña conversación', scenario: 'Un aldeano te saluda en el chat del servidor.', objective: 'Saluda, di tu nombre y responde "Nice to meet you".', starter: 'Hello! What is your name?', minTurns: 3 },
  ] },
  { skill: 'pronunciation', title: 'Pronunciation', xp: 20, exercises: [
    { type: 'multi_select', instruction: 'Selecciona las palabras con el Secret Sound', sound: '/h/', options: [{ text: 'Hello', correct: true }, { text: 'Hi', correct: true }, { text: 'Pig', correct: false }, { text: 'Blue', correct: false }, { text: 'Hey', correct: true }, { text: 'How', correct: true }] },
    { type: 'speak', instruction: 'Secret Sound Challenge', say: 'Hello, Hi, How are you?', prompt: 'Escucha y repite los sonidos /h/.' },
  ] },
];

const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
await c.query('begin');
try {
  const u = await c.query("select id from public.units where external_id='u1-1'");
  if (!u.rows.length) throw new Error('no existe u1-1');
  const unitId = u.rows[0].id;
  await c.query('delete from public.activities where unit_id=$1', [unitId]);
  let i = 0;
  for (const l of lessons) {
    await c.query(
      `insert into public.activities(unit_id, type, skill, title, order_index, xp_reward, content)
       values($1,'lesson',$2,$3,$4,$5,$6::jsonb)`,
      [unitId, l.skill, l.title, ++i, l.xp, JSON.stringify({ kind: 'lesson', skill: l.skill, exercises: l.exercises })]
    );
  }
  await c.query('commit');
  console.log(`OK: Unidad 1 con ${lessons.length} lecciones por destreza (${lessons.reduce((n, l) => n + l.exercises.length, 0)} ejercicios).`);
} catch (e) {
  await c.query('rollback');
  console.error('FAIL:', e.message);
  process.exitCode = 1;
}
await c.end();
