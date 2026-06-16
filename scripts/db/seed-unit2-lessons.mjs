// Reemplaza las actividades de la Unidad 2 (u1-2 "Colores") por 5 lecciones por
// destreza estilo Duolingo, con los 14 ejercicios del spec del fundador.
// Uso: node scripts/db/seed-unit2-lessons.mjs
import pg from 'pg';
import { readFileSync } from 'node:fs';
const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);

const lessons = [
  { skill: 'listening', title: 'Listening', xp: 15, exercises: [
    { type: 'audio_mc', instruction: 'Escucha y elige', audio: 'Red', options: ['Azul', 'Verde', 'Rojo'], correct: 2 },
    { type: 'who_said_it', instruction: '¿Quién lo dijo?', target: 'Blue', options: ['Blue', 'Bluh', 'Glue', 'Green'], correct: 0 },
    { type: 'audio_mc', instruction: 'Completa la conversación', audio: 'What color is it?', prompt: 'Elige la respuesta correcta', options: ['My name is.', 'It is red.', 'Hello.'], correct: 1 },
  ] },
  { skill: 'reading', title: 'Reading', xp: 15, exercises: [
    { type: 'match_pairs', instruction: 'Une cada palabra con su significado', pairs: [{ en: 'Red', es: 'Rojo' }, { en: 'Blue', es: 'Azul' }, { en: 'Green', es: 'Verde' }, { en: 'Color', es: 'Color' }] },
    { type: 'text_mc', instruction: 'Lee y elige', prompt: 'What color is it?', options: ['¿Qué color es?', '¿Cómo te llamas?', '¿Cómo estás?'], correct: 0 },
    { type: 'multi_select', instruction: 'Selecciona solo los colores', options: [{ text: 'Red', correct: true }, { text: 'Blue', correct: true }, { text: 'Green', correct: true }, { text: 'Pig', correct: false }, { text: 'Hello', correct: false }, { text: 'Tree', correct: false }] },
  ] },
  { skill: 'writing', title: 'Writing', xp: 15, exercises: [
    { type: 'word_bank', instruction: 'Ordena la oración', prompt: 'Es rojo.', answer: ['It', 'is', 'red.'] },
    { type: 'fill_blank', instruction: 'Completa la palabra que falta', before: 'It is', after: '.', options: ['hello', 'blue', 'pig'], correct: 1 },
    { type: 'free_text', instruction: 'Describe el color', prompt: 'What color is it? (una oveja roja) — It is ______', accept: ['it is red', 'red', 'rojo'] },
  ] },
  { skill: 'speaking', title: 'Speaking', xp: 20, exercises: [
    { type: 'speak', instruction: 'Repite después del personaje', say: 'It is blue.', prompt: 'Escucha y repítelo.' },
    { type: 'speak', instruction: 'Di el color', say: 'It is green.', prompt: 'Mira el bloque verde y dilo.' },
    { type: 'conversation', instruction: 'Pequeña conversación', scenario: 'Un aldeano te muestra bloques de colores en el chat del servidor.', objective: 'Saluda y responde de qué color es cada bloque (por ejemplo: It is red).', starter: 'Hello! What color is it?', minTurns: 3 },
  ] },
  { skill: 'pronunciation', title: 'Pronunciation', xp: 20, exercises: [
    { type: 'multi_select', instruction: 'Selecciona las palabras con el Secret Sound', sound: '/r/', options: [{ text: 'Red', correct: true }, { text: 'Green', correct: true }, { text: 'Color', correct: true }, { text: 'Blue', correct: false }, { text: 'Pig', correct: false }, { text: 'Hello', correct: false }] },
    { type: 'speak', instruction: 'Secret Sound Challenge', say: 'Red, Green, Red block', prompt: 'Escucha y repite el sonido /r/.' },
  ] },
];

const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
await c.query('begin');
try {
  const u = await c.query("select id from public.units where external_id='u1-2'");
  if (!u.rows.length) throw new Error('no existe u1-2');
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
  console.log(`OK: Unidad 2 (Colores) con ${lessons.length} lecciones (${lessons.reduce((n, l) => n + l.exercises.length, 0)} ejercicios).`);
} catch (e) {
  await c.query('rollback');
  console.error('FAIL:', e.message);
  process.exitCode = 1;
}
await c.end();
