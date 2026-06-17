// Motor de Aventuras (estilo Duolingo Adventures): mapa por casillas + NPCs con voz + diálogos
// ramificados por opciones + acertijo. El contenido se autora aquí; el player lo interpreta.

export type AdvChar = 'granjerita' | 'apicultor' | 'narrator' | 'npc1' | 'npc2' | 'npc3';

export type DialogueOption = {
    text: string;            // respuesta del jugador (en inglés)
    es?: string;             // traducción de apoyo
    correct?: boolean;       // la que avanza la historia
    reply?: string;          // lo que responde el NPC si eliges esta (inglés, con voz)
    replyEs?: string;
    clue?: string;           // pista que se registra (p. ej. 'fountain')
};

export type NPC = {
    id: string;
    name: string;
    char: AdvChar;           // voz + estilo
    emoji: string;           // sprite v1
    x: number; y: number;
    greeting: string; greetingEs?: string;   // saludo (voz)
    ask: string; askEs?: string;              // pregunta antes de las opciones (voz)
    options: DialogueOption[];
};

export type Interactable = {
    id: string;
    emoji: string;
    label: string;
    x: number; y: number;
    foundLine: string; foundEs?: string;      // al encontrar la llave aquí (correcto)
    wrongLine?: string; wrongEs?: string;      // si buscas aquí y no es (decoy)
};

export type Adventure = {
    id: string;
    title: string;
    intro: string;
    goal: string;
    reward: { xp: number; coins: number };
    cols: number; rows: number;
    grid: string[];          // '#' muro, '.' piso, 'T' árbol (muro decorativo)
    start: { x: number; y: number };
    npcs: NPC[];
    interactables: Interactable[];
    keyLocation: string;     // id del interactuable con la llave (correcto)
    chestId: string;         // cofre final (se abre tras hallar la llave)
    chestLockedLine: string; chestLockedEs?: string;
    completeLine: string; completeEs?: string;
};

// ─────────────────────────── Aventura v1: El Cofre Perdido ───────────────────────────
const cofrePerdido: Adventure = {
    id: 'cofre-perdido',
    title: 'El Cofre Perdido',
    intro: 'Steve perdió la llave dorada de su cofre del tesoro. Habla con los aldeanos para descubrir dónde está… ¡y ábrelo!',
    goal: 'Encuentra la llave y abre el cofre',
    reward: { xp: 40, coins: 10 },
    cols: 7, rows: 9,
    grid: [
        '#######',
        '#..C..#',
        '#.....#',
        '#.O.T.#',
        '#.....#',
        '#.....#',
        '#.....#',
        '#.....#',
        '#######',
    ],
    start: { x: 3, y: 6 },
    npcs: [
        {
            id: 'lily', name: 'Lily', char: 'granjerita', emoji: '👩‍🌾', x: 1, y: 5,
            greeting: "Hi! I'm Lily. You look worried.", greetingEs: '¡Hola! Soy Lily. Te ves preocupado.',
            ask: "What's wrong?", askEs: '¿Qué pasa?',
            options: [
                { text: 'I lost the golden key!', es: '¡Perdí la llave dorada!', correct: true, reply: 'Oh no! I saw something shiny near the water. Ask Sam, the beekeeper.', replyEs: '¡Oh no! Vi algo brillante cerca del agua. Pregúntale a Sam, el apicultor.', clue: 'water' },
                { text: 'I want to sleep.', es: 'Quiero dormir.' },
                { text: 'Where are the cows?', es: '¿Dónde están las vacas?' },
            ],
        },
        {
            id: 'sam', name: 'Sam', char: 'apicultor', emoji: '🧑‍🌾', x: 5, y: 5,
            greeting: "Buzz! I'm Sam the beekeeper.", greetingEs: '¡Bzz! Soy Sam, el apicultor.',
            ask: 'Do you need help?', askEs: '¿Necesitas ayuda?',
            options: [
                { text: 'Yes, where is the key?', es: 'Sí, ¿dónde está la llave?', correct: true, reply: "It's small and golden. It fell into the fountain!", replyEs: 'Es pequeña y dorada. ¡Se cayó en la fuente!', clue: 'fountain' },
                { text: 'No, goodbye.', es: 'No, adiós.' },
                { text: 'Give me honey.', es: 'Dame miel.' },
            ],
        },
        {
            id: 'max', name: 'Max', char: 'npc1', emoji: '🧑', x: 3, y: 7,
            greeting: 'Hello! Nice day, right?', greetingEs: '¡Hola! Lindo día, ¿no?',
            ask: 'Can I help you?', askEs: '¿Te puedo ayudar?',
            options: [
                { text: 'Have you seen a key?', es: '¿Has visto una llave?', correct: true, reply: 'Yes! Look in the fountain, not in the tree.', replyEs: '¡Sí! Busca en la fuente, no en el árbol.', clue: 'fountain' },
                { text: 'I am a tree.', es: 'Soy un árbol.' },
            ],
        },
    ],
    interactables: [
        { id: 'fountain', emoji: '⛲', label: 'Fuente', x: 2, y: 3, foundLine: 'You search the fountain… 🔑 You found the golden key!', foundEs: 'Buscas en la fuente… 🔑 ¡Encontraste la llave dorada!' },
        { id: 'tree', emoji: '🌳', label: 'Árbol', x: 4, y: 3, foundLine: '', wrongLine: 'Nothing here. Remember the clues!', wrongEs: 'Aquí no hay nada. ¡Recuerda las pistas!' },
        { id: 'chest', emoji: '🧰', label: 'Cofre', x: 3, y: 1, foundLine: '' },
    ],
    keyLocation: 'fountain',
    chestId: 'chest',
    chestLockedLine: "It's locked. You need the key first!", chestLockedEs: 'Está cerrado. ¡Primero necesitas la llave!',
    completeLine: 'You open the chest… 🎉 Treasure! Adventure complete!', completeEs: 'Abres el cofre… 🎉 ¡Tesoro! ¡Aventura completada!',
};

export const ADVENTURES: Record<string, Adventure> = { 'cofre-perdido': cofrePerdido };
export const getAdventure = (id: string): Adventure | undefined => ADVENTURES[id];

// Todas las líneas en inglés que se reproducen con voz (para pre-generar el audio).
export function adventureVoiceLines(a: Adventure): { role: AdvChar; text: string }[] {
    const out: { role: AdvChar; text: string }[] = [];
    for (const n of a.npcs) {
        out.push({ role: n.char, text: n.greeting }, { role: n.char, text: n.ask });
        for (const o of n.options) if (o.reply) out.push({ role: n.char, text: o.reply });
    }
    for (const it of a.interactables) {
        if (it.foundLine) out.push({ role: 'narrator', text: it.foundLine });
        if (it.wrongLine) out.push({ role: 'narrator', text: it.wrongLine });
    }
    out.push({ role: 'narrator', text: a.chestLockedLine }, { role: 'narrator', text: a.completeLine });
    return out;
}
