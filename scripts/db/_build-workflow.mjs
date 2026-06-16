// Genera el archivo de workflow (gen-lessons.workflow.js) embebiendo el vocabulario
// real + titulo de cada una de las 46 unidades a regenerar. Uso: node scripts/db/_build-workflow.mjs
import pg from 'pg';
import { readFileSync, writeFileSync } from 'node:fs';

const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);
const src = JSON.parse(readFileSync('./scripts/db/data/_unit-source.json', 'utf8'));

const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
const u = await c.query("select external_id, title from public.units order by order_index");
await c.end();
const titleOf = Object.fromEntries(u.rows.map((r) => [r.external_id, r.title]));

// 46 unidades: todas menos las 2 hechas a mano desde el spec (u1-1, u1-2)
const SRC = [];
for (const ext of Object.keys(src)) {
  if (ext === 'u1-1' || ext === 'u1-2') continue;
  SRC.push({ ext, title: titleOf[ext] || ext, vocab: src[ext].vocab });
}

// Ejemplo completo (Unidad 1 Saludos) — mismo formato que debe producir el agente.
const EXAMPLE = {
  ext: 'u1-1',
  lessons: [
    { skill: 'listening', title: 'Listening', xp: 15, exercises: [
      { type: 'audio_mc', instruction: 'Escucha y elige', audio: 'Hello!', options: ['Hola', 'Adiós', 'Gracias'], correct: 0 },
      { type: 'who_said_it', instruction: '¿Quién lo dijo?', target: 'Hi', options: ['Hello', 'Hi', 'Ai', 'Ei'], correct: 1 },
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
  ],
};

const PREAMBLE = `Eres diseñador de contenido de inglés estilo Duolingo para niños/adolescentes, ambientado en Minecraft. Crea UNA lección por destreza (5 en total) para la unidad indicada y ESCRIBE el resultado como un archivo JSON. No explores ni leas otros archivos: tienes todo lo necesario aquí.

REGLAS GENERALES:
- Instrucciones y pistas en ESPAÑOL. Lo que se escucha/dice/lee/ordena en inglés va en INGLÉS.
- Usa SOLO el vocabulario de la unidad que te doy (mismo tema). No inventes otros temas.
- Devuelve EXACTAMENTE 5 lecciones EN ESTE ORDEN y con estos metadatos:
  1) skill="listening", title="Listening", xp=15, 3 ejercicios
  2) skill="reading",   title="Reading",   xp=15, 3 ejercicios
  3) skill="writing",   title="Writing",   xp=15, 3 ejercicios
  4) skill="speaking",  title="Speaking",  xp=20, 3 ejercicios
  5) skill="pronunciation", title="Pronunciation", xp=20, 2 ejercicios

PATRÓN DE TIPOS POR DESTREZA:
- listening: audio_mc, who_said_it, audio_mc
- reading: match_pairs, text_mc, multi_select
- writing: word_bank, fill_blank, free_text
- speaking: speak, speak, conversation
- pronunciation: multi_select (con campo "sound"), speak

ESQUEMA EXACTO DE CADA TIPO:
- audio_mc:    {"type":"audio_mc","instruction":"<es>","audio":"<frase en INGLÉS que se escucha>","prompt":"<es opcional>","options":["<3 opciones>"],"correct":<indice 0-based>}
- who_said_it: {"type":"who_said_it","instruction":"<es>","target":"<palabra INGLESA correcta>","options":["<4 cosas que dicen los NPC, incluida la correcta>"],"correct":<indice del target>}
- text_mc:     {"type":"text_mc","instruction":"<es>","prompt":"<texto/pregunta, normalmente en inglés>","options":["<3 opciones, normalmente en español>"],"correct":<indice>}
- match_pairs: {"type":"match_pairs","instruction":"<es>","pairs":[{"en":"<inglés>","es":"<español>"} x4]}
- multi_select:{"type":"multi_select","instruction":"<es>","prompt":"<es opcional>","sound":"</fonema/ opcional>","options":[{"text":"<palabra>","correct":true|false} x6]}
- word_bank:   {"type":"word_bank","instruction":"<es>","prompt":"<traducción al español de la oración>","answer":["<palabras EN INGLÉS en el orden correcto>"]}
- fill_blank:  {"type":"fill_blank","instruction":"<es>","before":"<texto antes del hueco>","after":"<texto después>","options":["<3 opciones>"],"correct":<indice>}
- free_text:   {"type":"free_text","instruction":"<es>","prompt":"<consigna/pregunta>","accept":["<2-4 respuestas aceptadas EN MINÚSCULAS>"]}
- speak:       {"type":"speak","instruction":"<es>","say":"<frase EN INGLÉS a repetir>","prompt":"<es opcional>"}
- conversation:{"type":"conversation","instruction":"<es>","scenario":"<contexto en español, Minecraft>","objective":"<objetivo en español>","starter":"<primer mensaje del NPC EN INGLÉS>","minTurns":3}

CALIDAD (obligatorio):
- "correct" SIEMPRE apunta al índice correcto; verifícalo.
- Distractores plausibles. En who_said_it usa variantes fonéticas del target (p.ej. "Blue" -> "Bluh","Glue") + 1 palabra real distinta.
- Si el vocabulario son ORACIONES (no palabras sueltas), para who_said_it y para el multi_select de pronunciation EXTRAE una palabra clave corta de alguna oración.
- multi_select de reading ("Selecciona solo los X"): 3 correctas del tema (true) + 3 distractores de otro tema (false).
- multi_select de pronunciation: "sound" = un fonema presente en varias palabras (p.ej. /r/, /s/, /b/); marca true las que lo contienen.
- word_bank / fill_blank: usa una oración corta y real del vocabulario.
- conversation: starter en inglés; scenario/objective en español; ambientado en Minecraft; relacionado al tema de la unidad.

EJEMPLO COMPLETO (formato exacto que debes producir, para una unidad de Saludos):
${JSON.stringify(EXAMPLE.lessons, null, 1)}
`;

const META = `export const meta = {
  name: 'gen-duolingo-lessons',
  description: 'Genera 5 lecciones por destreza (estilo Duolingo) para las 46 unidades restantes',
  phases: [{ title: 'Generar', detail: 'un agente por unidad escribe su JSON' }],
};
`;

const BODY = `
const results = await parallel(SRC.map((u) => () =>
  agent(
    PREAMBLE +
      '\\n\\n## UNIDAD A GENERAR\\nexternal_id: ' + u.ext + '\\nTema de la unidad: ' + u.title + '\\nVocabulario disponible:\\n' +
      u.vocab.map((v) => '- ' + v.en + ' = ' + v.es).join('\\n') +
      '\\n\\nSALIDA: Usa la herramienta Write para crear el archivo en la ruta EXACTA \`scripts/db/data/gen/' + u.ext + '.json\`. ' +
      'El contenido debe ser EXACTAMENTE un objeto JSON válido (sin bloques de código markdown, sin texto extra) con la forma: ' +
      '{"ext":"' + u.ext + '","lessons":[ <las 5 lecciones> ]}. ' +
      'Después de escribir el archivo, responde solo: ok ' + u.ext,
    { label: 'gen:' + u.ext, phase: 'Generar', agentType: 'general-purpose' }
  ).then(() => ({ ext: u.ext, ok: true })).catch(() => ({ ext: u.ext, ok: false }))
));
log('Generadas ' + results.filter((r) => r && r.ok).length + '/' + SRC.length + ' unidades');
return results;
`;

const file =
  META +
  '\nconst PREAMBLE = ' + JSON.stringify(PREAMBLE) + ';\n' +
  'const SRC = ' + JSON.stringify(SRC) + ';\n' +
  BODY;

writeFileSync('./scripts/db/gen-lessons.workflow.js', file);
console.log('workflow escrito: scripts/db/gen-lessons.workflow.js');
console.log('unidades a generar:', SRC.length);
console.log('tamaño archivo (KB):', Math.round(file.length / 1024));
