// Genera gen-lessons.workflow.js: 6 lecciones PURAS por destreza (estilo Duolingo)
// para las 48 unidades, sin teclado en Niveles 1-3, con tipos nuevos y lectura interactiva.
// Uso: node scripts/db/_build-workflow.mjs
import pg from 'pg';
import { readFileSync, writeFileSync } from 'node:fs';

const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);
const src = JSON.parse(readFileSync('./scripts/db/data/_unit-source.json', 'utf8'));

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
const u = await c.query('select external_id, title from public.units order by order_index');
await c.end();
const titleOf = Object.fromEntries(u.rows.map((r) => [r.external_id, r.title]));

const allSrc = { ...src, ...EXTRA_SRC };
const SRC = [];
for (const r of u.rows) {
  const ext = r.external_id;
  const s = allSrc[ext];
  if (!s) continue;
  const band = parseInt((ext.match(/u(\d+)-/) || [])[1] || '9', 10);
  SRC.push({ ext, title: titleOf[ext] || ext, vocab: s.vocab, nokb: band <= 3 });
}

const PREAMBLE = `Eres diseñador de contenido de inglés estilo Duolingo para niños/adolescentes, ambientado en Minecraft. Crea 6 lecciones (una por destreza) para la unidad indicada y ESCRIBE el resultado como un archivo JSON. No explores otros archivos: tienes todo aquí.

REGLA DE ORO — PUREZA POR DESTREZA: cada lección SOLO puede contener los tipos permitidos de SU destreza (abajo). NUNCA mezcles tipos de otra destreza. (listening solo escucha+selección, reading solo texto+selección sin audio que regale, writing solo producción de texto, speaking solo voz, pronunciation solo fonética, conversation solo conversación.)

GENERALES:
- Instrucciones/pistas en ESPAÑOL, cortas y motivadoras. Lo que se escucha/dice/lee/ordena en inglés va en INGLÉS.
- Usa el vocabulario de la unidad (puedes combinar para formar oraciones simples del mismo tema).
- Devuelve EXACTAMENTE 6 lecciones EN ESTE ORDEN con estas cantidades y xp:

1) skill="listening", title="Listening", xp=20 — 7 ejercicios. Tipos permitidos: audio_mc, who_said_it, listen_build, listen_missing_word, tap_pairs_audio. Sugerido: 2 audio_mc, 1 who_said_it, 1 listen_build, 2 listen_missing_word, 1 tap_pairs_audio.
2) skill="reading", title="Reading", xp=25 — empieza con 1 reading_passage (obligatorio) y luego 4 más entre: text_mc, match_pairs, multi_select.
3) skill="writing", title="Writing", xp=20 — 6 ejercicios entre: word_bank, fill_blank, free_text. {WRITING}
4) skill="speaking", title="Speaking", xp=25 — 6 ejercicios: ~2 speak, ~2 speak_repeat, ~2 speak_answer. (NO conversación aquí.)
5) skill="pronunciation", title="Pronunciation", xp=20 — 5 ejercicios: 2 multi_select con "sound", 1-2 minimal_pairs, 1-2 speak.
6) skill="conversation", title="Conversación", xp=25 — 2 ejercicios "conversation" (escenarios/objetivos distintos del tema).

ESQUEMA EXACTO DE CADA TIPO:
- audio_mc:    {"type":"audio_mc","instruction":"<es>","audio":"<inglés que se escucha>","prompt":"<es opc>","options":["<3>"],"correct":<idx>}
- who_said_it: {"type":"who_said_it","instruction":"<es>","target":"<palabra inglesa>","options":["<4 palabras REALES y CLARAMENTE DISTINTAS en sonido, incluida la correcta; NADA de homófonos/inventadas>"],"correct":<idx del target>}
- listen_build:{"type":"listen_build","instruction":"<es>","audio":"<oración inglesa>","answer":["<palabras en orden>"],"prompt":"<traducción es opc>"}
- listen_missing_word:{"type":"listen_missing_word","instruction":"<es>","audio":"<oración inglesa completa>","options":["<3 palabras candidatas>"],"correct":<idx de la palabra que de verdad va>}
- tap_pairs_audio:{"type":"tap_pairs_audio","instruction":"<es>","pairs":[{"audio":"<palabra inglesa que suena>","word":"<la misma palabra escrita>"} x4]}
- text_mc:     {"type":"text_mc","instruction":"<es>","prompt":"<texto/pregunta en inglés>","options":["<3 en español>"],"correct":<idx>}
- match_pairs: {"type":"match_pairs","instruction":"<es>","pairs":[{"en":"<inglés>","es":"<español>"} x4]}
- multi_select:{"type":"multi_select","instruction":"<es>","prompt":"<es opc>","sound":"</fonema/ opc>","options":[{"text":"<palabra>","correct":bool} x6]}
- word_bank:   {"type":"word_bank","instruction":"<es>","prompt":"<traducción es>","answer":["<palabras inglesas en orden>"]}
- fill_blank:  {"type":"fill_blank","instruction":"<es>","before":"<antes del hueco>","after":"<después>","options":["<3>"],"correct":<idx>}
- free_text:   {"type":"free_text","instruction":"<es>","prompt":"<consigna>","accept":["<2-4 respuestas en minúsculas>"]}
- speak:       {"type":"speak","instruction":"<es>","say":"<frase inglesa a repetir>","prompt":"<es opc>"}
- speak_repeat:{"type":"speak_repeat","instruction":"<es>","say":"<frase inglesa modelo a repetir>","prompt":"<es opc>"}
- speak_answer:{"type":"speak_answer","instruction":"<es>","question":"<pregunta inglesa a responder hablando>","accept":["<palabras clave esperadas en minúsculas>"],"prompt":"<es opc>"}
- minimal_pairs:{"type":"minimal_pairs","instruction":"<es>","audio":"<la palabra que suena>","options":["<par mínimo: 2 palabras parecidas, p.ej. ship/sheep>"],"correct":<idx de la que suena>,"ipa":["</ʃɪp/>","</ʃiːp/>"]}
- conversation:{"type":"conversation","instruction":"<es>","scenario":"<contexto es, Minecraft>","objective":"<objetivo es>","starter":"<1er mensaje del NPC en inglés>","minTurns":3}
- reading_passage (LECTURA INTERACTIVA):
  {"type":"reading_passage","instruction":"<es>","title":"<título corto o null>","sentences":[{"id":0,"text":"<oración inglesa>"},{"id":1,"text":"<...>","gapId":1}, ...4-6 oraciones],"glossary":[{"word":"<palabra inglesa difícil>","es":"<traducción>"}...2-4],"questions":[ <3-5 preguntas encadenadas> ]}
  Tipos de pregunta (questions[].kind):
  · cloze: {"kind":"cloze","gapId":<= a un sentence.gapId>,"options":["<3>"],"correct":<idx>}  // IMPORTANTE: la palabra options[correct] DEBE aparecer literal en la oración con ese gapId.
  · insert_sentence: {"kind":"insert_sentence","afterSentenceId":<id>,"prompt":"¿Qué oración encaja?","options":["<3 oraciones>"],"correct":<idx>}
  · highlight: {"kind":"highlight","prompt":"<pregunta es/en>","correctSentenceId":<id de la oración del pasaje que responde>}
  · main_idea: {"kind":"main_idea","prompt":"¿Cuál es la idea principal?","options":["<3>"],"correct":<idx>}
  · title: {"kind":"title","prompt":"Elige el mejor título","options":["<3>"],"correct":<idx>}
  Incluye al menos un cloze (con su gapId en una oración), un highlight y un main_idea o title.

CALIDAD: "correct" siempre correcto (verifícalo). Distractores plausibles y, en who_said_it/listening, CLARAMENTE distintos en sonido (palabras reales del tema, nunca homófonos). En reading NUNCA pongas audio. who_said_it: target real del vocabulario; 3 distractores = otras palabras reales del tema distintas en sonido.

EJEMPLO de reading_passage (formato exacto):
${JSON.stringify({
  type: 'reading_passage', instruction: 'Lee la aventura y responde', title: null,
  sentences: [
    { id: 0, text: 'Yesterday Steve explored a dark cave.' },
    { id: 1, text: 'He mined ten diamonds and some iron.', gapId: 1 },
    { id: 2, text: 'Suddenly, a creeper appeared behind him.' },
    { id: 3, text: 'He ran to the surface and built a shelter before night.' },
  ],
  glossary: [{ word: 'cave', es: 'cueva' }, { word: 'shelter', es: 'refugio' }],
  questions: [
    { kind: 'cloze', gapId: 1, options: ['diamonds', 'villagers', 'clouds'], correct: 0 },
    { kind: 'highlight', prompt: 'What scared Steve?', correctSentenceId: 2 },
    { kind: 'main_idea', prompt: '¿Cuál es la idea principal?', options: ['Steve had a dangerous mining trip', 'Steve cooked dinner', 'Steve traded with villagers'], correct: 0 },
    { kind: 'title', prompt: 'Elige el mejor título', options: ['A Quiet Day Farming', 'Danger in the Cave', 'Building a House'], correct: 1 },
  ],
}, null, 1)}
`;

const META = `export const meta = {
  name: 'gen-pure-lessons-v3',
  description: 'Regenera 6 lecciones PURAS por destreza (con lectura interactiva y tipos nuevos) para las 48 unidades',
  phases: [{ title: 'Generar', detail: 'un agente por unidad escribe su JSON' }],
};
`;

const BODY = `
const results = await parallel(SRC.map((u) => () =>
  agent(
    PREAMBLE.replace('{WRITING}', u.nokb
      ? 'MODO SIN TECLADO (Nivel 1-3): NO uses free_text; usa solo word_bank y fill_blank.'
      : 'Puedes incluir 1-2 free_text además de word_bank y fill_blank.') +
      '\\n\\n## UNIDAD\\nexternal_id: ' + u.ext + '\\nTema: ' + u.title + '\\nVocabulario:\\n' +
      u.vocab.map((v) => '- ' + v.en + ' = ' + v.es).join('\\n') +
      '\\n\\nSALIDA: usa Write para crear EXACTAMENTE el archivo \`scripts/db/data/gen/' + u.ext + '.json\` con un objeto JSON válido (sin markdown) de la forma {"ext":"' + u.ext + '","lessons":[ <las 6 lecciones puras> ]}. Luego responde solo: ok ' + u.ext,
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
console.log('workflow escrito. unidades:', SRC.length, '| sin teclado:', SRC.filter((s) => s.nokb).length, '| KB:', Math.round(file.length / 1024));
