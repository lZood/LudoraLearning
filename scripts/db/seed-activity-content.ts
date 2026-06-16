// Seed de contenido REAL de actividades (Unidades 1 y 2) en activities.content.
// Idempotente: actualiza por (unit external_id, activity type). Uso: node scripts/db/seed-activity-content.ts
import pg from 'pg';
import { readFileSync } from 'node:fs';

const url = readFileSync('.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('SUPABASE_DB_URL=')).slice('SUPABASE_DB_URL='.length);

// content[unitExternalId][activityType] = ActivityContent
const content: Record<string, Record<string, unknown>> = {
    'u1-1': {
        theory: { kind: 'theory', slides: [
            { title: '¡Hola! Greetings', body: 'En el chat de Minecraft saludas a otros jugadores. Estas son las formas más comunes de decir "hola".', phrases: ['Hello — Hola', 'Hi — Hola (informal)', 'Hey — ¡Ey!'] },
            { title: 'Despedidas', body: 'Cuando te vas del servidor, te despides así:', phrases: ['Goodbye — Adiós', 'Bye — Chao', 'See you! — ¡Nos vemos!'] },
            { title: 'Preséntate', body: 'Para decir tu nombre en inglés:', phrases: ['My name is Steve — Me llamo Steve', 'I am Alex — Soy Alex', 'Nice to meet you — Mucho gusto'] },
        ] },
        exercise: { kind: 'quiz', intro: 'Practica los saludos.', questions: [
            { prompt: '¿Cómo dices "Hola" en el chat?', options: ['Hello', 'Apple', 'Stone', 'Run'], correct: 0, explanation: '"Hello" significa Hola.' },
            { prompt: 'Completa: "My ___ is Steve."', options: ['name', 'cat', 'tree', 'water'], correct: 0, explanation: '"My name is..." = Me llamo...' },
            { prompt: '¿Cómo te despides?', options: ['Goodbye', 'Pickaxe', 'Zombie', 'Night'], correct: 0, explanation: '"Goodbye" = Adiós.' },
            { prompt: '"Nice to meet you" significa…', options: ['Mucho gusto', 'Tengo hambre', 'Corre', 'Buenas noches'], correct: 0 },
        ] },
        audio: { kind: 'audio', tts: 'Hello! My name is Alex. Welcome to the server. Nice to meet you!', questions: [
            { prompt: '¿Cómo se llama?', options: ['Alex', 'Steve', 'Notch', 'Zombie'], correct: 0 },
            { prompt: '¿A dónde te da la bienvenida?', options: ['Al servidor (server)', 'A una cueva', 'Al Nether', 'A su casa'], correct: 0 },
        ] },
        chat: { kind: 'chat', scenario: 'Acabas de entrar al servidor y un aldeano te saluda en el chat.', objective: 'Salúdalo y preséntate (di tu nombre) en inglés.', starter: 'Hello, traveler! Welcome to our village. Who are you?', minTurns: 3 },
        midterm: { kind: 'quiz', intro: 'Repaso de la unidad.', questions: [
            { prompt: '"Hi" es una forma de…', options: ['saludar', 'despedirse', 'pedir ayuda', 'contar'], correct: 0 },
            { prompt: 'Elige el saludo informal:', options: ['Hey', 'Goodbye', 'Sorry', 'Please'], correct: 0 },
            { prompt: '"I am Alex" significa…', options: ['Soy Alex', 'Quiero a Alex', 'Veo a Alex', 'Adiós Alex'], correct: 0 },
        ] },
        final: { kind: 'quiz', intro: 'Reto final: demuestra lo aprendido.', questions: [
            { prompt: 'Entras al servidor. ¿Qué escribes primero?', options: ['Hello everyone!', 'Goodbye!', 'Zombie!', 'Stone'], correct: 0 },
            { prompt: 'Un jugador se va. Tú respondes:', options: ['See you!', 'My pickaxe', 'Three', 'Red'], correct: 0 },
            { prompt: 'Te preguntan tu nombre. Respondes:', options: ['My name is...', 'I have wood', 'It is night', 'Run!'], correct: 0 },
        ] },
    },
    'u1-2': {
        theory: { kind: 'theory', slides: [
            { title: 'Colores / Colors', body: 'Los bloques de Minecraft tienen muchos colores. Aprende los básicos:', phrases: ['Red — Rojo', 'Blue — Azul', 'Green — Verde', 'Yellow — Amarillo'] },
            { title: 'Más colores', body: 'Otros colores útiles para la lana (wool) y los bloques:', phrases: ['White — Blanco', 'Black — Negro', 'Brown — Café', 'Orange — Naranja'] },
            { title: 'Usar el color', body: 'Para describir un objeto pones el color antes del sustantivo:', phrases: ['A red bed — Una cama roja', 'Blue wool — Lana azul', 'Green grass — Pasto verde'] },
        ] },
        exercise: { kind: 'quiz', intro: 'Practica los colores.', questions: [
            { prompt: '¿Cómo se dice "Rojo"?', options: ['Red', 'Blue', 'Green', 'Black'], correct: 0 },
            { prompt: 'El pasto (grass) es de color…', options: ['Green', 'Red', 'Orange', 'White'], correct: 0 },
            { prompt: '"Blue wool" significa…', options: ['Lana azul', 'Lana roja', 'Cama azul', 'Bloque verde'], correct: 0 },
            { prompt: 'El color de la noche / del carbón:', options: ['Black', 'Yellow', 'White', 'Green'], correct: 0 },
        ] },
        audio: { kind: 'audio', tts: 'I have red wool, blue wool, and green wool. My favorite color is blue.', questions: [
            { prompt: '¿Qué colores de lana tiene?', options: ['Roja, azul y verde', 'Solo roja', 'Negra y blanca', 'Amarilla'], correct: 0 },
            { prompt: '¿Cuál es su color favorito?', options: ['Azul (blue)', 'Rojo', 'Verde', 'Blanco'], correct: 0 },
        ] },
        chat: { kind: 'chat', scenario: 'Un jugador te muestra su colección de bloques de colores.', objective: 'Pregúntale por un color y di cuál es tu color favorito en inglés.', starter: 'Look at my blocks! I have many colors. What is your favorite color?', minTurns: 3 },
        midterm: { kind: 'quiz', intro: 'Repaso de colores.', questions: [
            { prompt: '"Yellow" es…', options: ['Amarillo', 'Verde', 'Azul', 'Negro'], correct: 0 },
            { prompt: 'Una cama roja se dice:', options: ['A red bed', 'A bed red', 'Red a bed', 'Bed red a'], correct: 0 },
            { prompt: '"White" es…', options: ['Blanco', 'Café', 'Naranja', 'Rojo'], correct: 0 },
        ] },
        final: { kind: 'quiz', intro: 'Reto final de colores.', questions: [
            { prompt: 'Describe una oveja blanca:', options: ['A white sheep', 'Sheep white', 'White a sheep', 'A sheep'], correct: 0 },
            { prompt: '¿De qué color es una esmeralda (emerald)?', options: ['Green', 'Red', 'Black', 'Yellow'], correct: 0 },
            { prompt: 'Quieres lana naranja. Pides:', options: ['Orange wool', 'Wool orange', 'Orange a wool', 'Wool'], correct: 0 },
        ] },
    },
};

const c = new pg.Client({ connectionString: url, ssl: false });
c.on('error', () => {});
await c.connect();
await c.query('begin');
let n = 0;
try {
    for (const [unitExt, byType] of Object.entries(content)) {
        for (const [type, body] of Object.entries(byType)) {
            const r = await c.query(
                `update public.activities a set content = $1::jsonb
                 from public.units u
                 where a.unit_id = u.id and u.external_id = $2 and a.type = $3`,
                [JSON.stringify(body), unitExt, type]
            );
            n += r.rowCount ?? 0;
        }
    }
    await c.query('commit');
    console.log(`OK: ${n} actividades con contenido (unidades ${Object.keys(content).join(', ')}).`);
} catch (e) {
    await c.query('rollback');
    console.error('FAIL:', (e as Error).message);
    process.exitCode = 1;
}
await c.end();
