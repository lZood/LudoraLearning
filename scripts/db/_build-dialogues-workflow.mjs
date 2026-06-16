// Genera gen-dialogues.workflow.js: un chat guiado (dialogue) por unidad (3-4 turnos,
// cada uno con 3 respuestas, 1 correcta). Uso: node scripts/db/_build-dialogues-workflow.mjs
import pg from 'pg';
import { readFileSync, writeFileSync } from 'node:fs';
const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);
const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
const rows = (await c.query('select external_id, title from public.units order by order_index')).rows;
await c.end();
const UNITS = rows.map((r) => ({ ext: r.external_id, title: r.title, band: parseInt((r.external_id.match(/u(\d+)-/) || [])[1] || '9', 10) }));

const PREAMBLE = `Eres diseñador de contenido de inglés estilo Duolingo, ambientado en Minecraft, para niños/adolescentes hispanohablantes. Crea un CHAT GUIADO ("dialogue") para la unidad indicada: un personaje (NPC) escribe por chat y en CADA turno el alumno elige entre 3 respuestas posibles, SOLO UNA correcta.

REGLAS:
- 3 a 4 turnos. Inglés MUY sencillo y acorde al TEMA de la unidad.
- Cada turno: "npc" = lo que dice el personaje (en inglés), y "options" = 3 respuestas del alumno (en inglés), exactamente UNA con "correct": true.
- Las 2 incorrectas deben ser PLAUSIBLES pero claramente mal (error de gramática, número, orden o sentido). Ejemplo para "yellow blocks": correcta "I see yellow blocks", incorrectas "I see yellow block", "I see blocks yellow".
- El chat debe tener sentido como conversación corta y completa sobre el tema.
- persona = un nombre corto de personaje (ej. "Aldeano Alex", "Granjero Tom").

SALIDA: usa la herramienta Write para crear el archivo EXACTO \`scripts/db/data/dialogues/{EXT}.json\` con este JSON válido (sin markdown):
{"ext":"{EXT}","dialogue":{"type":"dialogue","instruction":"<consigna en español>","persona":"<nombre>","turns":[{"npc":"<inglés>","options":[{"text":"<inglés>","correct":true},{"text":"<inglés>","correct":false},{"text":"<inglés>","correct":false}]} , ... 3-4 turnos]}}
Después responde solo: ok {EXT}`;

const META = `export const meta = {
  name: 'gen-dialogues',
  description: 'Genera un chat guiado (3 respuestas, 1 correcta) por unidad',
  phases: [{ title: 'Generar' }],
};
`;
const BODY = `
const results = await parallel(UNITS.map((u) => () =>
  agent(
    PREAMBLE.replaceAll('{EXT}', u.ext) + '\\n\\nUNIDAD: ' + u.ext + ' — Tema: ' + u.title + ' (Nivel ' + u.band + ').',
    { label: 'dlg:' + u.ext, phase: 'Generar', agentType: 'general-purpose' }
  ).then(() => ({ ext: u.ext, ok: true })).catch(() => ({ ext: u.ext, ok: false }))
));
log('Diálogos: ' + results.filter((r) => r && r.ok).length + '/' + UNITS.length);
return results;
`;
const file = META + '\nconst PREAMBLE = ' + JSON.stringify(PREAMBLE) + ';\n' + 'const UNITS = ' + JSON.stringify(UNITS) + ';\n' + BODY;
writeFileSync('./scripts/db/gen-dialogues.workflow.js', file);
console.log('workflow de diálogos escrito. unidades:', UNITS.length);
