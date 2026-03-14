export type QuestionLevel = 'Pre-A1' | 'A1' | 'A1-alto' | 'A2' | 'A2-alto' | 'B1';
export type QuestionCategory = 'Gramática y Vocabulario' | 'Comprensión Auditiva' | 'Producción Escrita' | 'Producción Oral' | 'Identificación Visual';

export type QuestionType = 'multiple-choice' | 'image-choice' | 'audio-listening' | 'text-input' | 'audio-record';

export interface AnswerOption {
    text: string;
    isCorrect?: boolean;
    imageUrl?: string; // For image-choice
}

export interface Question {
    id: string;
    skillId: string;
    level: QuestionLevel;
    category: QuestionCategory;
    type: QuestionType;
    text: string;

    // For multiple choice / image choice
    options?: AnswerOption[];

    // For audio listening questions
    audioUrl?: string;

    // For Gemini AI grading reference
    expectedKeywords?: string[];
    gradingRubric?: string;
}

export const questionBank: Question[] = [
    // --- Pre-A1 ---
    {
        id: 'pre-a1-1',
        skillId: 'PREA1-VOCAB-CHEST',
        level: 'Pre-A1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Ves un cofre (chest). ¿Qué palabra describe la acción de abrirlo?',
        options: [
            { text: 'Open the chest.', isCorrect: true },
            { text: 'Running to the chest.', isCorrect: false },
            { text: 'I am a chest.', isCorrect: false },
            { text: 'Close the door.', isCorrect: false },
        ]
    },
    {
        id: 'pre-a1-2',
        skillId: 'PREA1-VISUAL-PICKAXE',
        level: 'Pre-A1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: '¿Cuál de las siguientes imágenes corresponde a un "Pickaxe"?',
        options: [
            { text: 'Pickaxe', isCorrect: true, imageUrl: '/images/placeholders/pickaxe.png' }, // Placeholder URL
            { text: 'Sword', isCorrect: false, imageUrl: '/images/placeholders/sword.png' },
            { text: 'Axe', isCorrect: false, imageUrl: '/images/placeholders/axe.png' },
            { text: 'Shovel', isCorrect: false, imageUrl: '/images/placeholders/shovel.png' },
        ]
    },
    {
        id: 'pre-a1-3',
        skillId: 'PREA1-GRAMMAR-VERBTOBE',
        level: 'Pre-A1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Elige la frase correcta para decir "Yo soy Steve":',
        options: [
            { text: 'I am Steve.', isCorrect: true },
            { text: 'I is Steve.', isCorrect: false },
            { text: 'Me Steve.', isCorrect: false },
            { text: 'You are Steve.', isCorrect: false },
        ]
    },
    {
        id: 'pre-a1-4',
        skillId: 'PREA1-ORAL-GREETING',
        level: 'Pre-A1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Graba un audio diciendo: "Hello, my name is Alex".',
        gradingRubric: 'El usuario debe pronunciar una variación entendible de "Hello my name is Alex" o similar.',
        expectedKeywords: ['hello', 'name', 'is', 'alex']
    },
    {
        id: 'pre-a1-5',
        skillId: 'PREA1-WRITTEN-COLORS',
        level: 'Pre-A1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: "Los zombies son de color verde. ¿Cómo se escribe 'verde' en inglés?",
        gradingRubric: 'El usuario debe escribir la palabra green de forma correcta o casi correcta.',
        expectedKeywords: ['green']
    },

    // --- A1 ---
    {
        id: 'a1-1',
        skillId: 'A1-LISTENING-TRADE',
        level: 'A1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/a1_listening_1.mp3', // Placeholder
        text: 'Escucha el audio. ¿Qué mineral está pidiendo el aldeano?',
        options: [
            { text: 'Iron (Hierro)', isCorrect: true },
            { text: 'Emerald (Esmeralda)', isCorrect: false },
            { text: 'Diamond (Diamante)', isCorrect: false },
            { text: 'Gold (Oro)', isCorrect: false },
        ]
    },
    {
        id: 'a1-2',
        skillId: 'A1-GRAMMAR-POSSESSION',
        level: 'A1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Quieres decir que "Tú tienes un pico de diamante". ¿Cuál es correcta?',
        options: [
            { text: 'You have a diamond pickaxe.', isCorrect: true },
            { text: 'You has a diamond pickaxe.', isCorrect: false },
            { text: 'You are a diamond pickaxe.', isCorrect: false },
            { text: 'You having diamond pickaxe.', isCorrect: false },
        ]
    },
    {
        id: 'a1-3',
        skillId: 'A1-WRITTEN-HELP',
        level: 'A1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Estás perdido en la cueva. Escribe en el chat pidiendo ayuda brevemente (ej. "Ayúdame por favor" en inglés).',
        gradingRubric: 'El texto debe comunicar una petición de ayuda simple y estructurada.',
        expectedKeywords: ['help', 'please', 'me', 'need']
    },
    {
        id: 'a1-4',
        skillId: 'A1-VISUAL-GLASS',
        level: 'A1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Selecciona la imagen que muestra "Glass":',
        options: [
            { text: 'Glass', isCorrect: true, imageUrl: '/images/placeholders/glass.png' },
            { text: 'Dirt', isCorrect: false, imageUrl: '/images/placeholders/dirt.png' },
            { text: 'Stone', isCorrect: false, imageUrl: '/images/placeholders/stone.png' },
            { text: 'Lava', isCorrect: false, imageUrl: '/images/placeholders/lava.gif' },
        ]
    },
    {
        id: 'a1-5',
        skillId: 'A1-ORAL-WARN',
        level: 'A1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Hay un Creeper detrás de un amigo. Graba un audio avisándole rápidamente (ej. "Look behind you!" o "Watch out!").',
        gradingRubric: 'El audio debe ser una advertencia de peligro en inglés.',
    },

    // --- A1-alto ---
    {
        id: 'a1-alto-1',
        skillId: 'A1ALTO-GRAMMAR-PAST',
        level: 'A1-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Quieres decirle a tu equipo que encontraste una cueva ayer.',
        options: [
            { text: 'I found a cave yesterday.', isCorrect: true },
            { text: 'I find a cave yesterday.', isCorrect: false },
            { text: 'I will find a cave yesterday.', isCorrect: false },
            { text: 'I finding a cave yesterday.', isCorrect: false },
        ]
    },
    {
        id: 'a1-alto-2',
        skillId: 'A1ALTO-WRITTEN-PLANS',
        level: 'A1-alto',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Alguien te pregunta qué vas a construir mañana. Escribe tu respuesta en una oración completa usando el futuro (going to / will).',
        gradingRubric: 'Debe usar alguna forma de tiempo futuro para expresar un plan de construcción.',
    },
    {
        id: 'a1-alto-3',
        skillId: 'A1ALTO-LISTENING-URGENT',
        level: 'A1-alto',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/a1_alto_listening.mp3',
        text: 'Escucha el audio de tu compañero. ¿Por qué está asustado?',
        options: [
            { text: 'Hizo un agujero y cayó a la lava.', isCorrect: true },
            { text: 'Lo está persiguiendo un Enderman.', isCorrect: false },
            { text: 'Se perdió en el bosque.', isCorrect: false },
            { text: 'Se rompió su armadura.', isCorrect: false },
        ]
    },
    {
        id: 'a1-alto-4',
        skillId: 'A1ALTO-GRAMMAR-SHOULD',
        level: 'A1-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Tu amigo está minando pero no usa antorchas. ¿Qué le dices?',
        options: [
            { text: 'You should place torches.', isCorrect: true },
            { text: 'You placed torches.', isCorrect: false },
            { text: 'You placing torches.', isCorrect: false },
            { text: 'You torches.', isCorrect: false },
        ]
    },
    {
        id: 'a1-alto-5',
        skillId: 'A1ALTO-ORAL-DESCRIBE',
        level: 'A1-alto',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Describe brevemente en voz alta un bloque de arena ("Sand is block, it falls...").',
        gradingRubric: 'Debe describir la arena o cualquier propiedad de la arena en inglés básico.',
    },

    // --- A2 ---
    {
        id: 'a2-1',
        skillId: 'A2-GRAMMAR-COMPARATIVE',
        level: 'A2',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Comparas dos picos. ¿Cuál es la forma correcta?',
        options: [
            { text: 'This pickaxe is better than that one.', isCorrect: true },
            { text: 'This pickaxe is more better than that one.', isCorrect: false },
            { text: 'This pickaxe is gooder than that one.', isCorrect: false },
            { text: 'This pickaxe is the best than that one.', isCorrect: false },
        ]
    },
    {
        id: 'a2-2',
        skillId: 'A2-SITUATIONAL-PLAN',
        level: 'A2',
        category: 'Comprensión Auditiva', // Asignando a auditiva en lugar de situacional, o lectura.
        type: 'multiple-choice',
        text: 'El líder del grupo dice: "Let\'s split up. Alex, you gather wood. Sarah, you mine for coal. I\'ll stay and defend the base." ¿Qué debe hacer Sarah?',
        options: [
            { text: 'Sarah debe minar carbón.', isCorrect: true },
            { text: 'Sarah debe juntar madera.', isCorrect: false },
            { text: 'Sarah debe proteger la base.', isCorrect: false },
            { text: 'Sarah debe huir dividiéndose.', isCorrect: false },
        ]
    },
    {
        id: 'a2-3',
        skillId: 'A2-WRITTEN-EMPATHY',
        level: 'A2',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Tu amigo acaba de perder sus diamantes por la lava. Escríbele un mensaje consolándolo y ofreciéndole ayuda.',
        gradingRubric: 'El mensaje debe mostrar empatía (ej. I am sorry, that is sad) y ofrecer ayuda o regalarle ítems.',
    },
    {
        id: 'a2-4',
        skillId: 'A2-GRAMMAR-CONDITIONAL',
        level: 'A2',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "If I find diamonds, I ___ a diamond sword."',
        options: [
            { text: 'will make', isCorrect: true },
            { text: 'made', isCorrect: false },
            { text: 'making', isCorrect: false },
            { text: 'makes', isCorrect: false },
        ]
    },
    {
        id: 'a2-5',
        skillId: 'A2-ORAL-DIRECTIONS',
        level: 'A2',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Graba en audio dando instrucciones a otro jugador para que vaya hacia la montaña detrás del río.',
        gradingRubric: 'Debe usar preposiciones de lugar o instrucciones direccionales (go, look, behind, river, mountain).',
    },

    // --- A2-alto ---
    {
        id: 'a2-alto-1',
        skillId: 'A2ALTO-GRAMMAR-PRES-PERF',
        level: 'A2-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Quieres saber si alguien ya ha visitado El Nether alguna vez en su vida.',
        options: [
            { text: 'Have you ever been to The Nether?', isCorrect: true },
            { text: 'Did you went to The Nether?', isCorrect: false },
            { text: 'Are you being to The Nether?', isCorrect: false },
            { text: 'Have you go The Nether?', isCorrect: false },
        ]
    },
    {
        id: 'a2-alto-2',
        skillId: 'A2ALTO-WRITTEN-DISAGREE',
        level: 'A2-alto',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Estás en desacuerdo con la estrategia del equipo. Redacta de forma educada tu objeción y presenta una alternativa.',
        gradingRubric: 'Debe mostrar desacuerdo cortés (I think we should..., Maybe it is better if...)',
    },
    {
        id: 'a2-alto-3',
        skillId: 'A2ALTO-LISTENING-STORY',
        level: 'A2-alto',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/a2_alto_listening.mp3',
        text: '"Before we enter the woodland mansion, we must ensure everyone has enough potions." ¿Qué significa esto?',
        options: [
            { text: 'Hacer preparativos vitales (pociones) es obligatorio antes de entrar.', isCorrect: true },
            { text: 'Las pociones se encuentran adentro.', isCorrect: false },
            { text: 'La mansión evita las pociones.', isCorrect: false },
            { text: 'Nadie tiene pociones.', isCorrect: false },
        ]
    },
    {
        id: 'a2-alto-4',
        skillId: 'A2ALTO-VISUAL-ENCHANT',
        level: 'A2-alto',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: '¿Cuál es la Enchanting Table?',
        options: [
            { text: 'Enchanting Table', isCorrect: true, imageUrl: '/images/placeholders/enchanting.png' },
            { text: 'Crafting Table', isCorrect: false, imageUrl: '/images/placeholders/crafting.png' },
            { text: 'Furnace', isCorrect: false, imageUrl: '/images/placeholders/furnace.png' },
            { text: 'Anvil', isCorrect: false, imageUrl: '/images/placeholders/anvil.png' },
        ]
    },
    {
        id: 'a2-alto-5',
        skillId: 'A2ALTO-ORAL-PROHIBIT',
        level: 'A2-alto',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Graba en audio explicando a un usuario nuevo una regla importante de tu servidor (ej. prohibido robar o destruir bases).',
        gradingRubric: 'Debe usar lenguaje de obligación o prohibición (must not, have to, don\'t, forbidden).',
    },

    // --- B1 ---
    {
        id: 'b1-1',
        skillId: 'B1-SITUATIONAL-COMPLEX',
        level: 'B1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: '"Even though we secured the stronghold, we ran out of supplies, which forced us to retreat." ¿Por qué retrocedieron?',
        options: [
            { text: 'Porque se quedaron sin provisiones, a pesar de haber asegurado el lugar.', isCorrect: true },
            { text: 'Porque no pudieron asegurar la fortaleza.', isCorrect: false },
            { text: 'Porque no querían seguir avanzando más allá de la fortaleza.', isCorrect: false },
            { text: 'Porque se perdieron buscando la fortaleza.', isCorrect: false },
        ]
    },
    {
        id: 'b1-2',
        skillId: 'B1-WRITTEN-EXPLAIN',
        level: 'B1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Escribe una breve guía de un párrafo explicando cómo funciona un Observer de Redstone.',
        gradingRubric: 'Debe contener oraciones subordinadas, vocabulario técnico básico de MC y explicar causa y efecto.',
    },
    {
        id: 'b1-3',
        skillId: 'B1-VOCAB-DECEPTIVE',
        level: 'B1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Para describir a un jugador que confunde a otros intencionalmente en un servidor PvP:',
        options: [
            { text: 'Deceptive', isCorrect: true },
            { text: 'Trustworthy', isCorrect: false },
            { text: 'Honest', isCorrect: false },
            { text: 'Clumsy', isCorrect: false },
        ]
    },
    {
        id: 'b1-4',
        skillId: 'B1-ORAL-NEGOTIATE',
        level: 'B1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Graba un audio negociando pacíficamente una disputa de territorio con otro jugador.',
        gradingRubric: 'El lenguaje debe ser respetuoso, ofrecer compromisos o condicionales asertivos.',
    },
    {
        id: 'b1-5',
        skillId: 'B1-GRAMMAR-3RD-COND',
        level: 'B1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Hablando de una situación hipotética en el pasado que no ocurrió (ej. no trajiste pociones y moriste):',
        options: [
            { text: 'If we had brought fire resistance potions, we wouldn\'t have died in the lava.', isCorrect: true },
            { text: 'If we bring potions, we not died.', isCorrect: false },
            { text: 'If we brought potions, we will not die.', isCorrect: false },
            { text: 'If we had bring potions, we don\'t die.', isCorrect: false },
        ]
    },

    // --- NUEVAS PREGUNTAS (Para asegurar 2-3 de cada tipo y evaluar más profundamente el habla) ---

    // Pre-A1 Nuevas
    { id: 'pre-a1-ext-1', skillId: 'PREA1-LIST-PIG', level: 'Pre-A1', category: 'Comprensión Auditiva', type: 'audio-listening', audioUrl: '/audios/pre_a1_pig.mp3', text: 'Escucha. ¿Qué animal es (Pig = Cerdo)?', options: [{ text: 'Pig (Cerdo)', isCorrect: true }, { text: 'Cow (Vaca)', isCorrect: false }] },
    { id: 'pre-a1-ext-2', skillId: 'PREA1-LIST-ZOMBIE', level: 'Pre-A1', category: 'Comprensión Auditiva', type: 'audio-listening', audioUrl: '/audios/pre_a1_zombie.mp3', text: 'Escucha este sonido. ¿A qué criatura pertenece?', options: [{ text: 'Zombie', isCorrect: true }, { text: 'Creeper', isCorrect: false }] },
    { id: 'pre-a1-ext-3', skillId: 'PREA1-VISUAL-DIRT', level: 'Pre-A1', category: 'Identificación Visual', type: 'image-choice', text: 'Identifica el bloque de tierra (Dirt):', options: [{ text: 'Dirt', isCorrect: true, imageUrl: '/images/placeholders/dirt.png' }, { text: 'Stone', isCorrect: false, imageUrl: '/images/placeholders/stone.png' }] },
    { id: 'pre-a1-ext-4', skillId: 'PREA1-ORAL-JUMP', level: 'Pre-A1', category: 'Producción Oral', type: 'audio-record', text: 'Di en voz alta la acción de "Saltar" en inglés ("Jump").', gradingRubric: 'El alumno pronuncia claramente la palabra jump o algo similar.', expectedKeywords: ['jump'] },
    { id: 'pre-a1-ext-5', skillId: 'PREA1-WRITTEN-RUN', level: 'Pre-A1', category: 'Producción Escrita', type: 'text-input', text: 'Escribe la palabra para "Correr" en inglés.', gradingRubric: 'Debe escribir run', expectedKeywords: ['run'] },

    // A1 Nuevas
    { id: 'a1-ext-1', skillId: 'A1-GRAMMAR-LIKE', level: 'A1', category: 'Gramática y Vocabulario', type: 'multiple-choice', text: 'Quieres decir "Me gustan las manzanas".', options: [{ text: 'I like apples.', isCorrect: true }, { text: 'I likes apples.', isCorrect: false }] },
    { id: 'a1-ext-2', skillId: 'A1-LIST-BUILD', level: 'A1', category: 'Comprensión Auditiva', type: 'audio-listening', audioUrl: '/audios/a1_build.mp3', text: '¿Qué quiere hacer el jugador con esa madera?', options: [{ text: 'Construir una casa (Build a house)', isCorrect: true }, { text: 'Quemar la madera', isCorrect: false }] },
    { id: 'a1-ext-3', skillId: 'A1-WRITTEN-GREET', level: 'A1', category: 'Producción Escrita', type: 'text-input', text: 'Entras al servidor. Escribe un saludo básico a todos.', gradingRubric: 'Mensaje de saludo como "Hi everyone" o "Hello guys".' },
    { id: 'a1-ext-4', skillId: 'A1-VISUAL-COW', level: 'A1', category: 'Identificación Visual', type: 'image-choice', text: 'Encuentra a la vaca (Cow):', options: [{ text: 'Cow', isCorrect: true, imageUrl: '/images/placeholders/cow.png' }, { text: 'Pig', isCorrect: false, imageUrl: '/images/placeholders/pig.png' }] },
    { id: 'a1-ext-5', skillId: 'A1-ORAL-NUMBERS', level: 'A1', category: 'Producción Oral', type: 'audio-record', text: 'Tienes 5 bloques. Di en inglés "Tengo cinco bloques".', gradingRubric: 'Pronunciación de "I have five blocks".' },

    // A1-alto Nuevas
    { id: 'a1-alto-ext-1', skillId: 'A1ALTO-VISUAL-BED', level: 'A1-alto', category: 'Identificación Visual', type: 'image-choice', text: '¿Qué objeto usas para dormir y saltarte la noche?', options: [{ text: 'Bed', isCorrect: true, imageUrl: '/images/placeholders/bed.png' }, { text: 'Slab', isCorrect: false, imageUrl: '/images/placeholders/slab.png' }] },
    { id: 'a1-alto-ext-2', skillId: 'A1ALTO-VISUAL-APPLE', level: 'A1-alto', category: 'Identificación Visual', type: 'image-choice', text: 'Selecciona una Manzana Dorada (Golden Apple):', options: [{ text: 'Golden Apple', isCorrect: true, imageUrl: '/images/placeholders/gapple.png' }, { text: 'Carrot', isCorrect: false, imageUrl: '/images/placeholders/carrot.png' }] },
    { id: 'a1-alto-ext-3', skillId: 'A1ALTO-WRITTEN-NEED', level: 'A1-alto', category: 'Producción Escrita', type: 'text-input', text: 'Escribe en el chat que "necesitas comida".', gradingRubric: 'El alumno pide comida usando "need food" o "I am hungry".' },
    { id: 'a1-alto-ext-4', skillId: 'A1ALTO-LIST-FIGHT', level: 'A1-alto', category: 'Comprensión Auditiva', type: 'audio-listening', audioUrl: '/audios/a1_alto_fight.mp3', text: '"They are attacking the village!" ¿Qué pasa?', options: [{ text: 'La aldea está siendo atacada.', isCorrect: true }, { text: 'La aldea está vacía.', isCorrect: false }] },
    { id: 'a1-alto-ext-5', skillId: 'A1ALTO-ORAL-WHERE', level: 'A1-alto', category: 'Producción Oral', type: 'audio-record', text: 'Pregúntale en voz alta a un amigo "¿Dónde estás?".', gradingRubric: 'Hacer la pregunta de ubicación en inglés simple.' },

    // A2 Nuevas
    { id: 'a2-ext-1', skillId: 'A2-VISUAL-NETHER', level: 'A2', category: 'Identificación Visual', type: 'image-choice', text: 'Identifica un portal al Nether.', options: [{ text: 'Nether Portal', isCorrect: true, imageUrl: '/images/placeholders/portal.png' }, { text: 'End Portal', isCorrect: false, imageUrl: '/images/placeholders/endportal.png' }] },
    { id: 'a2-ext-2', skillId: 'A2-VISUAL-BOAT', level: 'A2', category: 'Identificación Visual', type: 'image-choice', text: 'Identifica el Bote (Boat).', options: [{ text: 'Boat', isCorrect: true, imageUrl: '/images/placeholders/boat.png' }, { text: 'Minecart', isCorrect: false, imageUrl: '/images/placeholders/minecart.png' }] },
    { id: 'a2-ext-3', skillId: 'A2-LIST-DIRECTIONS', level: 'A2', category: 'Comprensión Auditiva', type: 'audio-listening', audioUrl: '/audios/a2_directions.mp3', text: '"Go straight past the mountain, it\'s on the left." ¿Hacia dónde debes ir?', options: [{ text: 'Pasar la montaña y a la izquierda.', isCorrect: true }, { text: 'Atrás de la montaña a la derecha.', isCorrect: false }] },
    { id: 'a2-ext-4', skillId: 'A2-WRITTEN-INVITE', level: 'A2', category: 'Producción Escrita', type: 'text-input', text: 'Invita textualmente a un jugador a unirse a tu facción/equipo.', gradingRubric: 'Debe contener una oferta o invitación ("Join my team", "Do you want to play with us?").' },
    { id: 'a2-ext-5', skillId: 'A2-ORAL-WARN2', level: 'A2', category: 'Producción Oral', type: 'audio-record', text: 'Graba en voz alta aconsejando a tu amigo: "No deberías cavar directamente hacia abajo" ("You shouldn\'t dig straight down").', gradingRubric: 'El alumno debe dar el famoso consejo de Minecraft usando un modal o imperativo de no hacerlo.' },

    // A2-alto Nuevas
    { id: 'a2-alto-ext-1', skillId: 'A2ALTO-GRAMMAR-SINCE', level: 'A2-alto', category: 'Gramática y Vocabulario', type: 'multiple-choice', text: 'Quiero decir que he jugado este servidor desde 2021.', options: [{ text: 'I have played on this server since 2021.', isCorrect: true }, { text: 'I have played on this server for 2021.', isCorrect: false }] },
    { id: 'a2-alto-ext-2', skillId: 'A2ALTO-LIST-TRADE', level: 'A2-alto', category: 'Comprensión Auditiva', type: 'audio-listening', audioUrl: '/audios/a2_alto_trade.mp3', text: '"I\'ll give you 10 iron ingots if you can enchant my sword with Sharpness." ¿Qué ofrece a cambio del encantamiento?', options: [{ text: '10 lingotes de hierro.', isCorrect: true }, { text: 'Una espada afilada.', isCorrect: false }] },
    { id: 'a2-alto-ext-3', skillId: 'A2ALTO-WRITTEN-APOLOGY', level: 'A2-alto', category: 'Producción Escrita', type: 'text-input', text: 'Mataste a un compañero de equipo por accidente y tomó tu flecha. Escribe disculpándote y explicando que fue un accidente.', gradingRubric: 'Debe disculparse ("I am sorry", "My fault") y excusarse ("It was an accident", "I didn\'t mean to").' },
    { id: 'a2-alto-ext-4', skillId: 'A2ALTO-VISUAL-TRIPWIRE', level: 'A2-alto', category: 'Identificación Visual', type: 'image-choice', text: 'Identifica el mecanismo o la trampa de "Tripwire Hook".', options: [{ text: 'Tripwire', isCorrect: true, imageUrl: '/images/placeholders/tripwire.png' }, { text: 'Lever', isCorrect: false, imageUrl: '/images/placeholders/lever.png' }] },
    { id: 'a2-alto-ext-5', skillId: 'A2ALTO-ORAL-EXCUSE', level: 'A2-alto', category: 'Producción Oral', type: 'audio-record', text: 'Explica en voz alta por qué no pudiste defender la base: "Había demasiados zombies y no tenía espada".', gradingRubric: 'Usar "there were too many" o similar para explicar la desventaja.' },

    // B1 Nuevas
    { id: 'b1-ext-1', skillId: 'B1-LIST-PLAN', level: 'B1', category: 'Comprensión Auditiva', type: 'audio-listening', audioUrl: '/audios/b1_plan.mp3', text: '"First we kill the shulkers guarding the entrance, then we bridge to the ship before grabbing the elytra." ¿Cuál es el último paso?', options: [{ text: 'Agarrar las elitras (grabbing the elytra).', isCorrect: true }, { text: 'Hacer puentes (bridge to the ship).', isCorrect: false }] },
    { id: 'b1-ext-2', skillId: 'B1-LIST-REASON', level: 'B1', category: 'Comprensión Auditiva', type: 'audio-listening', audioUrl: '/audios/b1_reason.mp3', text: '"He was banned because he was exploiting a duplication glitch." ¿Qué hizo el jugador baneado?', options: [{ text: 'Estaba abusando de un fallo del juego para multiplicar ítems.', isCorrect: true }, { text: 'Insultó a un administrador.', isCorrect: false }] },
    { id: 'b1-ext-3', skillId: 'B1-VISUAL-BEACON', level: 'B1', category: 'Identificación Visual', type: 'image-choice', text: 'Identifica un Beacon (Faro mágico) activado.', options: [{ text: 'Beacon', isCorrect: true, imageUrl: '/images/placeholders/beacon.png' }, { text: 'Conduit', isCorrect: false, imageUrl: '/images/placeholders/conduit.png' }] },
    { id: 'b1-ext-4', skillId: 'B1-VISUAL-REDSTONE', level: 'B1', category: 'Identificación Visual', type: 'image-choice', text: 'Identifica un circuito de reloj (Redstone Clock).', options: [{ text: 'Redstone Clock', isCorrect: true, imageUrl: '/images/placeholders/redstone_clock.png' }, { text: 'Piston Door', isCorrect: false, imageUrl: '/images/placeholders/piston_door.png' }] },
    { id: 'b1-ext-5', skillId: 'B1-WRITTEN-APPEAL', level: 'B1', category: 'Producción Escrita', type: 'text-input', text: 'Te banearon injustamente. Redacta un mensaje para apelar justificando que fue un lag (retraso en tu conexión).', gradingRubric: 'Debe formular una queja o apelación educada usando conector causal (because, due to) justificándose con lag/connection.' },
    { id: 'b1-ext-6', skillId: 'B1-ORAL-PERSUADE', level: 'B1', category: 'Producción Oral', type: 'audio-record', text: 'Convence verbalmente a tu clan de ir a asaltar un Templo Oceánico esta noche argumentando que dará buenos materiales.', gradingRubric: 'Debe contener expresiones persuasivas (We should, Let\'s go, It will be worth it) y prometer beneficios.' }
];
