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
    theme?: 'overworld' | 'nether';   // paleta del mundo voxel (default overworld)
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

// ─────────────────────── Aventura 2: La Poción Perdida ───────────────────────
const pocionPerdida: Adventure = {
    id: 'pocion-perdida',
    title: 'La Poción Perdida',
    intro: 'Mara, la curandera, necesita una flor brillante para terminar su poción. Habla con los aldeanos y encuéntrala.',
    goal: 'Encuentra la flor mágica y termina la poción',
    reward: { xp: 40, coins: 10 },
    cols: 7, rows: 9,
    grid: ['#######', '#.....#', '#.....#', '#.....#', '#.....#', '#.....#', '#.....#', '#.....#', '#######'],
    start: { x: 3, y: 7 },
    npcs: [
        {
            id: 'mara', name: 'Mara', char: 'granjerita', emoji: '🧙‍♀️', x: 1, y: 5,
            greeting: "Hello! I'm Mara the healer.", greetingEs: '¡Hola! Soy Mara, la curandera.',
            ask: 'Are you lost?', askEs: '¿Estás perdido?',
            options: [
                { text: 'I need a glowing flower.', es: 'Necesito una flor brillante.', correct: true, reply: 'The blue flower? I saw petals near the old tree!', replyEs: '¿La flor azul? ¡Vi pétalos cerca del árbol viejo!', clue: 'tree' },
                { text: 'I want a cookie.', es: 'Quiero una galleta.' },
                { text: "Where's my cat?", es: '¿Dónde está mi gato?' },
            ],
        },
        {
            id: 'sam2', name: 'Sam', char: 'apicultor', emoji: '🧑‍🌾', x: 5, y: 5,
            greeting: 'Buzz! Need some honey?', greetingEs: '¡Bzz! ¿Quieres miel?',
            ask: 'Can I help?', askEs: '¿Te puedo ayudar?',
            options: [
                { text: 'Where is the magic flower?', es: '¿Dónde está la flor mágica?', correct: true, reply: 'It grows in shade — look by the tree, not the water.', replyEs: 'Crece en la sombra: busca junto al árbol, no en el agua.', clue: 'tree' },
                { text: 'No, thanks.', es: 'No, gracias.' },
            ],
        },
        {
            id: 'tom', name: 'Tom', char: 'npc1', emoji: '🧒', x: 3, y: 6,
            greeting: 'Hi there, traveler!', greetingEs: '¡Hola, viajero!',
            ask: 'What do you seek?', askEs: '¿Qué buscas?',
            options: [
                { text: 'A glowing flower for a potion.', es: 'Una flor brillante para una poción.', correct: true, reply: 'Yes! Search under the big tree.', replyEs: '¡Sí! Busca bajo el árbol grande.', clue: 'tree' },
                { text: 'Nothing, bye.', es: 'Nada, adiós.' },
            ],
        },
    ],
    interactables: [
        { id: 'fountain', emoji: '⛲', label: 'Fuente', x: 2, y: 3, foundLine: '', wrongLine: 'Just water here. Think about the clues!', wrongEs: 'Aquí solo hay agua. ¡Piensa en las pistas!' },
        { id: 'tree', emoji: '🌳', label: 'Árbol', x: 4, y: 3, foundLine: 'You look under the tree… 🌸 You found the glowing flower!', foundEs: 'Buscas bajo el árbol… 🌸 ¡Encontraste la flor brillante!' },
        { id: 'chest', emoji: '🧰', label: 'Caja de pociones', x: 3, y: 1, foundLine: '' },
    ],
    keyLocation: 'tree', chestId: 'chest',
    chestLockedLine: 'The potion box is sealed. Find the flower first!', chestLockedEs: 'La caja está sellada. ¡Primero encuentra la flor!',
    completeLine: 'You add the flower… 🎉 The potion is ready! Adventure complete!', completeEs: 'Agregas la flor… 🎉 ¡La poción está lista! ¡Aventura completada!',
};

// ─────────────────────── Aventura 3: El Aldeano Desaparecido ───────────────────────
const aldeanoDesaparecido: Adventure = {
    id: 'aldeano-desaparecido',
    title: 'El Aldeano Desaparecido',
    intro: 'Un aldeano no volvió a casa. Pregunta por la aldea y sigue las pistas para hallarlo.',
    goal: 'Sigue las pistas y encuentra al aldeano',
    reward: { xp: 40, coins: 10 },
    cols: 9, rows: 9,
    grid: ['#########', '#.......#', '#.......#', '#.......#', '#.......#', '#.......#', '#.......#', '#.......#', '#########'],
    start: { x: 4, y: 7 },
    npcs: [
        {
            id: 'nina', name: 'Nina', char: 'granjerita', emoji: '👩‍🌾', x: 2, y: 5,
            greeting: "Hi! I'm Nina.", greetingEs: '¡Hola! Soy Nina.',
            ask: 'You look in a hurry.', askEs: 'Te ves apurado.',
            options: [
                { text: 'Have you seen the lost villager?', es: '¿Has visto al aldeano perdido?', correct: true, reply: 'He went to fetch water. Check the fountain!', replyEs: 'Fue por agua. ¡Busca en la fuente!', clue: 'fountain' },
                { text: 'I am hungry.', es: 'Tengo hambre.' },
            ],
        },
        {
            id: 'ben', name: 'Ben', char: 'apicultor', emoji: '🧑‍🌾', x: 6, y: 5,
            greeting: 'Buzz! Hello!', greetingEs: '¡Bzz! ¡Hola!',
            ask: 'Need help?', askEs: '¿Necesitas ayuda?',
            options: [
                { text: 'Where did he go?', es: '¿A dónde fue?', correct: true, reply: 'Near the water, not the tree.', replyEs: 'Cerca del agua, no del árbol.', clue: 'fountain' },
                { text: 'Give me honey.', es: 'Dame miel.' },
            ],
        },
        {
            id: 'leo', name: 'Leo', char: 'npc1', emoji: '🧒', x: 4, y: 6,
            greeting: 'Hey, friend!', greetingEs: '¡Hola, amigo!',
            ask: 'Any questions?', askEs: '¿Alguna pregunta?',
            options: [
                { text: 'Any clues about him?', es: '¿Alguna pista de él?', correct: true, reply: 'Look in the fountain for his note.', replyEs: 'Busca su nota en la fuente.', clue: 'fountain' },
                { text: 'No, bye.', es: 'No, adiós.' },
            ],
        },
    ],
    interactables: [
        { id: 'tree', emoji: '🌳', label: 'Árbol', x: 2, y: 3, foundLine: '', wrongLine: 'Nothing here. Remember the clues!', wrongEs: 'Aquí no hay nada. ¡Recuerda las pistas!' },
        { id: 'fountain', emoji: '⛲', label: 'Fuente', x: 6, y: 3, foundLine: 'You search the fountain… 📜 You found his note with the key!', foundEs: 'Buscas en la fuente… 📜 ¡Encontraste su nota con la llave!' },
        { id: 'chest', emoji: '🧰', label: 'Cofre', x: 4, y: 1, foundLine: '' },
    ],
    keyLocation: 'fountain', chestId: 'chest',
    chestLockedLine: "It's his chest, but it's locked. Find the key!", chestLockedEs: 'Es su cofre, pero está cerrado. ¡Encuentra la llave!',
    completeLine: 'You open the chest… 🎉 A map shows he is safe! Adventure complete!', completeEs: 'Abres el cofre… 🎉 ¡Un mapa muestra que está a salvo! ¡Aventura completada!',
};

// ─────────────────────── Aventura 4: El Portal Roto ───────────────────────
const portalRoto: Adventure = {
    id: 'portal-roto',
    title: 'El Portal Roto',
    intro: 'Un viejo portal en la pradera está apagado: le falta su cristal. Encuéntralo y enciéndelo.',
    goal: 'Encuentra el cristal y enciende el portal',
    reward: { xp: 40, coins: 10 },
    cols: 9, rows: 9,
    grid: ['#########', '#.......#', '#.......#', '#.......#', '#.......#', '#.......#', '#.......#', '#.......#', '#########'],
    start: { x: 4, y: 7 },
    npcs: [
        {
            id: 'iris', name: 'Iris', char: 'granjerita', emoji: '👩‍🌾', x: 2, y: 5,
            greeting: "Hello! I'm Iris.", greetingEs: '¡Hola! Soy Iris.',
            ask: 'The portal is dark, right?', askEs: 'El portal está apagado, ¿no?',
            options: [
                { text: 'The portal needs a crystal.', es: 'El portal necesita un cristal.', correct: true, reply: 'A purple crystal? I saw it glow by the tree!', replyEs: '¿Un cristal morado? ¡Lo vi brillar junto al árbol!', clue: 'tree' },
                { text: 'I like rocks.', es: 'Me gustan las rocas.' },
            ],
        },
        {
            id: 'gus', name: 'Gus', char: 'apicultor', emoji: '🧑‍🌾', x: 6, y: 5,
            greeting: 'Buzz! Careful here.', greetingEs: '¡Bzz! Ten cuidado aquí.',
            ask: 'What do you need?', askEs: '¿Qué necesitas?',
            options: [
                { text: 'Where is the crystal?', es: '¿Dónde está el cristal?', correct: true, reply: 'In the tree roots, not the water.', replyEs: 'En las raíces del árbol, no en el agua.', clue: 'tree' },
                { text: 'Nothing.', es: 'Nada.' },
            ],
        },
        {
            id: 'pip', name: 'Pip', char: 'npc1', emoji: '🧒', x: 4, y: 6,
            greeting: 'Hi! Want to fix the portal?', greetingEs: '¡Hola! ¿Quieres arreglar el portal?',
            ask: 'Can you help?', askEs: '¿Puedes ayudar?',
            options: [
                { text: 'Help me find the crystal.', es: 'Ayúdame a encontrar el cristal.', correct: true, reply: 'Search the tree for the crystal!', replyEs: '¡Busca el cristal en el árbol!', clue: 'tree' },
                { text: 'Not now.', es: 'Ahora no.' },
            ],
        },
    ],
    interactables: [
        { id: 'fountain', emoji: '⛲', label: 'Fuente', x: 2, y: 3, foundLine: '', wrongLine: 'No crystal in the water. Think again!', wrongEs: 'No hay cristal en el agua. ¡Piensa de nuevo!' },
        { id: 'tree', emoji: '🌳', label: 'Árbol', x: 6, y: 3, foundLine: 'You dig by the tree… 💎 You found the purple crystal!', foundEs: 'Escarbas junto al árbol… 💎 ¡Encontraste el cristal morado!' },
        { id: 'chest', emoji: '📦', label: 'Marco del portal', x: 4, y: 1, foundLine: '' },
    ],
    keyLocation: 'tree', chestId: 'chest',
    chestLockedLine: 'The portal is dark. You need the crystal!', chestLockedEs: 'El portal está apagado. ¡Necesitas el cristal!',
    completeLine: 'You place the crystal… 🎉 The portal glows! Adventure complete!', completeEs: 'Colocas el cristal… 🎉 ¡El portal brilla! ¡Aventura completada!',
};

// ─────────────────────── Aventura 5: La Cosecha ───────────────────────
const laCosecha: Adventure = {
    id: 'la-cosecha',
    title: 'La Cosecha',
    intro: 'Rosa perdió sus semillas doradas antes de sembrar. Ayúdala a encontrarlas para la gran cosecha.',
    goal: 'Encuentra las semillas doradas y siémbralas',
    reward: { xp: 40, coins: 10 },
    cols: 9, rows: 8,
    grid: ['#########', '#.......#', '#.......#', '#.......#', '#.......#', '#.......#', '#.......#', '#########'],
    start: { x: 4, y: 6 },
    npcs: [
        {
            id: 'rosa', name: 'Rosa', char: 'granjerita', emoji: '👩‍🌾', x: 2, y: 5,
            greeting: "Hi! I'm Rosa the farmer.", greetingEs: '¡Hola! Soy Rosa, la granjera.',
            ask: 'Oh, what a day!', askEs: '¡Ay, qué día!',
            options: [
                { text: 'I lost the golden seeds!', es: '¡Perdí las semillas doradas!', correct: true, reply: 'Golden seeds? They rolled near the water!', replyEs: '¿Semillas doradas? ¡Rodaron cerca del agua!', clue: 'fountain' },
                { text: 'I want a horse.', es: 'Quiero un caballo.' },
            ],
        },
        {
            id: 'hank', name: 'Hank', char: 'apicultor', emoji: '🧑‍🌾', x: 6, y: 5,
            greeting: 'Buzz! Busy day!', greetingEs: '¡Bzz! ¡Día ocupado!',
            ask: 'Need a hand?', askEs: '¿Una mano?',
            options: [
                { text: 'Where are the seeds?', es: '¿Dónde están las semillas?', correct: true, reply: 'By the fountain, not the tree.', replyEs: 'Junto a la fuente, no al árbol.', clue: 'fountain' },
                { text: 'No, thanks.', es: 'No, gracias.' },
            ],
        },
        {
            id: 'will', name: 'Will', char: 'npc1', emoji: '🧒', x: 4, y: 4,
            greeting: 'Hello! Lovely farm, right?', greetingEs: '¡Hola! Linda granja, ¿no?',
            ask: 'Looking for something?', askEs: '¿Buscas algo?',
            options: [
                { text: 'Have you seen golden seeds?', es: '¿Has visto semillas doradas?', correct: true, reply: 'Yes! Check by the fountain.', replyEs: '¡Sí! Revisa junto a la fuente.', clue: 'fountain' },
                { text: 'Just walking.', es: 'Solo paseo.' },
            ],
        },
    ],
    interactables: [
        { id: 'tree', emoji: '🌳', label: 'Árbol', x: 6, y: 2, foundLine: '', wrongLine: 'No seeds here. Remember the clues!', wrongEs: 'Aquí no hay semillas. ¡Recuerda las pistas!' },
        { id: 'fountain', emoji: '⛲', label: 'Fuente', x: 2, y: 2, foundLine: 'You look by the fountain… 🌾 You found the golden seeds!', foundEs: 'Buscas junto a la fuente… 🌾 ¡Encontraste las semillas doradas!' },
        { id: 'chest', emoji: '🧰', label: 'Granero', x: 4, y: 1, foundLine: '' },
    ],
    keyLocation: 'fountain', chestId: 'chest',
    chestLockedLine: 'The barn box is locked. Find the seeds first!', chestLockedEs: 'La caja del granero está cerrada. ¡Primero encuentra las semillas!',
    completeLine: 'You plant the seeds… 🎉 The harvest is golden! Adventure complete!', completeEs: 'Siembras las semillas… 🎉 ¡La cosecha es dorada! ¡Aventura completada!',
};

export const ADVENTURES: Record<string, Adventure> = {
    'cofre-perdido': cofrePerdido,
    'pocion-perdida': pocionPerdida,
    'aldeano-desaparecido': aldeanoDesaparecido,
    'portal-roto': portalRoto,
    'la-cosecha': laCosecha,
};
export const getAdventure = (id: string): Adventure | undefined => ADVENTURES[id];

// Lista para el hub de juegos (orden + presentación).
export function listAdventures(): { id: string; title: string; tagline: string; emoji: string; accent: string }[] {
    return [
        { id: 'cofre-perdido', title: cofrePerdido.title, tagline: cofrePerdido.goal, emoji: '🗺️', accent: '#3b7a1e' },
        { id: 'pocion-perdida', title: pocionPerdida.title, tagline: pocionPerdida.goal, emoji: '🧪', accent: '#7b3fa0' },
        { id: 'aldeano-desaparecido', title: aldeanoDesaparecido.title, tagline: aldeanoDesaparecido.goal, emoji: '🔎', accent: '#2f6fae' },
        { id: 'portal-roto', title: portalRoto.title, tagline: portalRoto.goal, emoji: '🌀', accent: '#8a3fb0' },
        { id: 'la-cosecha', title: laCosecha.title, tagline: laCosecha.goal, emoji: '🌾', accent: '#c08a2a' },
    ];
}

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
