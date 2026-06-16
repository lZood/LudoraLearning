// Genera el archivo de workflow (gen-lessons.workflow.js) embebiendo el vocabulario
// real + titulo de cada unidad. Lecciones largas (variable 6-10), sin teclado en
// Niveles 1-3, e incluye el tipo listen_build. Cubre las 48 unidades.
// Uso: node scripts/db/_build-workflow.mjs
import pg from 'pg';
import { readFileSync, writeFileSync } from 'node:fs';

const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);
const src = JSON.parse(readFileSync('./scripts/db/data/_unit-source.json', 'utf8'));

// u1-1 y u1-2 no están en lesson-content.json (se hicieron a mano desde el spec).
// Les damos vocabulario para regenerarlas largas + sin teclado como las demás de Nivel 1.
const EXTRA_SRC = {
  'u1-1': { vocab: [
    { en: 'Hello', es: 'Hola' }, { en: 'Hi', es: 'Hola (informal)' }, { en: 'Hey', es: 'Hola (muy informal)' },
    { en: 'Good morning', es: 'Buenos días' }, { en: 'Goodbye', es: 'Adiós' }, { en: 'Bye', es: 'Adiós (informal)' },
    { en: 'Nice to meet you', es: 'Mucho gusto' }, { en: 'My name is', es: 'Me llamo' },
    { en: 'What is your name?', es: '¿Cómo te llamas?' }, { en: 'How are you?', es: '¿Cómo estás?' },
    { en: "I'm good", es: 'Estoy bien' }, { en: 'Thank you', es: 'Gracias' },
    { en: 'My name is Steve', es: 'Me llamo Steve' }, { en: 'See you later', es: 'Hasta luego' },
  ] },
  'u1-2': { vocab: [
    { en: 'Red', es: 'Rojo' }, { en: 'Blue', es: 'Azul' }, { en: 'Green', es: 'Verde' }, { en: 'Yellow', es: 'Amarillo' },
    { en: 'Black', es: 'Negro' }, { en: 'White', es: 'Blanco' }, { en: 'Color', es: 'Color' },
    { en: 'What color is it?', es: '¿Qué color es?' }, { en: 'It is red', es: 'Es rojo' }, { en: 'It is blue', es: 'Es azul' },
    { en: 'It is green', es: 'Es verde' }, { en: 'The sky is blue', es: 'El cielo es azul' }, { en: 'The grass is green', es: 'El pasto es verde' },
  ] },
};

const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
const u = await c.query("select external_id, title from public.units order by order_index");
await c.end();
const titleOf = Object.fromEntries(u.rows.map((r) => [r.external_id, r.title]));

const allSrc = { ...src, ...EXTRA_SRC };
const SRC = [];
for (const r of u.rows) {
  const ext = r.external_id;
  const s = allSrc[ext];
  if (!s) continue; // no debería pasar
  const band = parseInt((ext.match(/u(\d+)-/) || [])[1] || '9', 10);
  SRC.push({ ext, title: titleOf[ext] || ext, vocab: s.vocab, nokb: band <= 3 });
}

// Ejemplos de FORMATO: un objeto por cada tipo (no son una lección completa).
const SAMPLES = [
  { type: 'audio_mc', instruction: 'Escucha y elige', audio: 'Hello!', options: ['Hola', 'Adiós', 'Gracias'], correct: 0 },
  { type: 'who_said_it', instruction: '¿Quién lo dijo?', target: 'Hi', options: ['Hello', 'Hi', 'Ai', 'Ei'], correct: 1 },
  { type: 'listen_build', instruction: 'Escucha y arma la frase', audio: 'My name is Steve', answer: ['My', 'name', 'is', 'Steve'], prompt: 'Me llamo Steve.' },
  { type: 'text_mc', instruction: 'Lee y elige', prompt: 'What is your name?', options: ['¿Cómo te llamas?', '¿Cómo estás?', '¿Qué color es?'], correct: 0 },
  { type: 'match_pairs', instruction: 'Une cada palabra con su significado', pairs: [{ en: 'Hello', es: 'Hola' }, { en: 'Bye', es: 'Adiós' }, { en: 'Nice to meet you', es: 'Mucho gusto' }, { en: 'My name is', es: 'Me llamo' }] },
  { type: 'multi_select', instruction: 'Selecciona solo los saludos', options: [{ text: 'Hello', correct: true }, { text: 'Hi', correct: true }, { text: 'Pig', correct: false }, { text: 'Red', correct: false }, { text: 'Hey', correct: true }, { text: 'Bye', correct: false }] },
  { type: 'word_bank', instruction: 'Ordena la oración', prompt: 'Me llamo Alex.', answer: ['My', 'name', 'is', 'Alex.'] },
  { type: 'fill_blank', instruction: 'Completa la palabra que falta', before: 'My', after: 'is Steve.', options: ['name', 'blue', 'pig'], correct: 0 },
  { type: 'free_text', instruction: 'Preséntate', prompt: 'What is your name? — My name is ______', accept: ['my name is', 'i am', 'name is'] },
  { type: 'speak', instruction: 'Repite después del personaje', say: 'Hello Steve', prompt: 'Escucha y repítelo.' },
  { type: 'conversation', instruction: 'Pequeña conversación', scenario: 'Un aldeano te saluda en el chat del servidor.', objective: 'Saluda, di tu nombre y responde "Nice to meet you".', starter: 'Hello! What is your name?', minTurns: 3 },
];

const PREAMBLE = `Eres diseñador de contenido de inglés estilo Duolingo para niños/adolescentes, ambientado en Minecraft. Crea UNA lección por destreza (5 en total) para la unidad indicada y ESCRIBE el resultado como un archivo JSON. No explores ni leas otros archivos: tienes todo lo necesario aquí.

REGLAS GENERALES:
- Instrucciones y pistas en ESPAÑOL, cortas y motivadoras (las "dice" un personaje). Lo que se escucha/dice/lee/ordena en inglés va en INGLÉS.
- Usa el vocabulario de la unidad que te doy (mismo tema). Puedes COMBINAR esas palabras para formar oraciones simples nuevas del mismo tema.
- Devuelve EXACTAMENTE 5 lecciones EN ESTE ORDEN y con estas CANTIDADES (lecciones largas):
  1) skill="listening", title="Listening", xp=20, 9 ejercicios
  2) skill="reading",   title="Reading",   xp=20, 9 ejercicios
  3) skill="writing",   title="Writing",   xp=20, 7 ejercicios
  4) skill="speaking",  title="Speaking",  xp=25, 8 ejercicios
  5) skill="pronunciation", title="Pronunciation", xp=25, 5 ejercicios

VARIEDAD (importante): dentro de cada lección ALTERNA los tipos; no repitas el mismo tipo más de 2 veces seguidas. Reparte el vocabulario para que cada ejercicio practique algo distinto (no repitas la misma palabra/oración en todos).

TIPOS POR DESTREZA (combínalos para llegar a la cantidad pedida):
- listening (9): audio_mc (varios), who_said_it (2-3), listen_build (1-2).
- reading (9): match_pairs (1-2), text_mc (varios), multi_select (1-2).
- writing (7): word_bank (varios) y fill_blank (varios); free_text SOLO si la unidad lo permite (ver abajo).
- speaking (8): speak (varios) y conversation (1-2).
- pronunciation (5): multi_select con campo "sound" (2) y speak (2-3).

ESQUEMA EXACTO DE CADA TIPO:
- audio_mc:    {"type":"audio_mc","instruction":"<es>","audio":"<frase en INGLÉS que se escucha>","prompt":"<es opcional>","options":["<3 opciones>"],"correct":<indice 0-based>}
- who_said_it: {"type":"who_said_it","instruction":"<es>","target":"<palabra INGLESA correcta>","options":["<4 cosas que dicen los NPC, incluida la correcta>"],"correct":<indice del target>}
- listen_build:{"type":"listen_build","instruction":"<es>","audio":"<oración EN INGLÉS que se escucha>","answer":["<palabras EN INGLÉS en orden correcto>"],"prompt":"<traducción al español, opcional>"}
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
- Si el vocabulario son ORACIONES, para who_said_it y para el multi_select de pronunciation EXTRAE una palabra clave corta.
- multi_select de reading ("Selecciona solo los X"): 3 correctas del tema (true) + 3 distractores de otro tema (false).
- multi_select de pronunciation: "sound" = un fonema presente en varias palabras (p.ej. /r/, /s/, /b/); marca true las que lo contienen.
- word_bank / fill_blank / listen_build: usa oraciones cortas y reales del tema (3-6 palabras).
- conversation: starter en inglés; scenario/objective en español; ambientado en Minecraft y relacionado al tema.

EJEMPLOS DE FORMATO (solo muestran cómo se ve CADA tipo; tú debes generar las CANTIDADES pedidas arriba, así que las lecciones son más largas):
${JSON.stringify(SAMPLES, null, 1)}
`;

const META = `export const meta = {
  name: 'gen-duolingo-lessons-v2',
  description: 'Regenera 5 lecciones largas por destreza (estilo Duolingo) para las 48 unidades, sin teclado en Niveles 1-3',
  phases: [{ title: 'Generar', detail: 'un agente por unidad escribe su JSON' }],
};
`;

const BODY = `
const results = await parallel(SRC.map((u) => () =>
  agent(
    PREAMBLE +
      '\\n\\n## UNIDAD A GENERAR\\nexternal_id: ' + u.ext + '\\nTema de la unidad: ' + u.title + '\\n' +
      (u.nokb
        ? 'MODO SIN TECLADO (nivel principiante): NO uses free_text en ninguna lección. En writing usa SOLO word_bank, fill_blank y listen_build (el alumno arma con fichas, nunca escribe con teclado).\\n'
        : 'En writing puedes incluir 1-2 free_text además de word_bank y fill_blank.\\n') +
      'Vocabulario disponible:\\n' +
      u.vocab.map((v) => '- ' + v.en + ' = ' + v.es).join('\\n') +
      '\\n\\nSALIDA: Usa la herramienta Write para crear el archivo en la ruta EXACTA \`scripts/db/data/gen/' + u.ext + '.json\`. ' +
      'El contenido debe ser EXACTAMENTE un objeto JSON válido (sin bloques de código markdown, sin texto extra) con la forma: ' +
      '{"ext":"' + u.ext + '","lessons":[ <las 5 lecciones con las cantidades pedidas> ]}. ' +
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
console.log('unidades a generar:', SRC.length, '| sin teclado (N1-3):', SRC.filter((s) => s.nokb).length);
console.log('tamaño archivo (KB):', Math.round(file.length / 1024));
