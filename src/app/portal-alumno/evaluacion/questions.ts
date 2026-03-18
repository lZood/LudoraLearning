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
        id: 'a1-list-1',
        skillId: 'A1-LIST-IRON',
        level: 'A1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A1/A1_MiningIron.wav',
        text: 'Escucha el audio. ¿Qué está haciendo el jugador?',
        options: [
            { text: 'Minando hierro en una cueva', isCorrect: true },
            { text: 'Construyendo una casa', isCorrect: false },
            { text: 'Peleando con un zombie', isCorrect: false },
            { text: 'Nadando en agua', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar la acción principal en presente continuo: \'mining iron in a cave\'. Se aceptan respuestas que incluyan \'mining\', \'iron\' o \'cave\'.',
        expectedKeywords: ['mining', 'iron', 'cave']
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
        id: 'a1-alto-list-1',
        skillId: 'A1ALTO-LIST-LAVA',
        level: 'A1-alto',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A1_Alto/A1_Alto_Diamongs.wav',
        text: 'Escucha el audio. ¿Qué pasó?',
        options: [
            { text: 'Cayó en lava y perdió diamantes', isCorrect: true },
            { text: 'Encontró un cofre de diamantes', isCorrect: false },
            { text: 'Construyó una base nueva', isCorrect: false },
            { text: 'Intercambió con un aldeano', isCorrect: false }
        ],
        gradingRubric: 'La IA evaluadora espera que el alumno identifique que el jugador cayó a la lava y perdió diamantes. Aceptar frases cortas como \'fell into lava\', \'lost my diamonds\' o su versión en español equivalente. Respuestas parciales que mencionen solo \'lava\' o solo \'diamonds\' obtienen puntuación parcial.',
        expectedKeywords: ['lava', 'diamonds', 'fell', 'lost']
    },
    {
        id: 'a1-alto-list-2',
        skillId: 'A1ALTO-LIST-ZOMBIE',
        level: 'A1-alto',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A1_Alto/A1_Alto_Zombie.wav',
        text: 'Escucha el audio. ¿Qué debe hacer el equipo?',
        options: [
            { text: 'Poner antorchas alrededor del granero', isCorrect: true },
            { text: 'Construir un puente al granero', isCorrect: false },
            { text: 'Vender en el mercado', isCorrect: false },
            { text: 'Ir al Nether', isCorrect: false }
        ],
        gradingRubric: 'Se espera que el alumno entienda la instrucción de iluminar/poner antorchas porque hay un zombie cerca. Respuestas que indiquen \'light up\', \'place torches\' o sinónimos claros obtienen máxima puntuación. Menciones vagas como \'do something with the barn\' reciben puntuación parcial.',
        expectedKeywords: ['zombie', 'barn', 'light', 'torches', 'behind']
    },
    {
        id: 'a1-alto-list-3',
        skillId: 'A1ALTO-LIST-BREAD',
        level: 'A1-alto',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A1_Alto/A1_Alto_Bread.wav',
        text: 'Escucha el audio. ¿Qué ofrece a cambio del pan?',
        options: [
            { text: 'Dos esmeraldas', isCorrect: true },
            { text: 'Un diamante', isCorrect: false },
            { text: 'Una espada de madera', isCorrect: false },
            { text: 'Diez lingotes de hierro', isCorrect: false }
        ],
        gradingRubric: 'El evaluador debe comprobar que el alumno identifica la oferta: \'two emeralds\' o su traducción. Aceptar \'dos esmeraldas\' o \'2 emeralds\'. Cualquier respuesta que no indique la cantidad correcta o el ítem exacto debe recibir menor puntuación.',
        expectedKeywords: ['villager', 'bread', 'two', 'emeralds', 'give']
    },
    {
        id: 'a1-alto-list-4',
        skillId: 'A1ALTO-LIST-COORDS',
        level: 'A1-alto',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A1_Alto/A1_Alto_Coords.wav',
        text: 'Escucha el audio. ¿Cuál es la instrucción principal?',
        options: [
            { text: 'Reunirse en las coordenadas', isCorrect: true },
            { text: 'Empezar a minar ahora', isCorrect: false },
            { text: 'Intercambiar con el aldeano', isCorrect: false },
            { text: 'Ir al portal del Nether', isCorrect: false }
        ],
        gradingRubric: 'Se espera que el alumno entienda la instrucción de reunirse en las coordenadas dadas. Respuestas como \'meet at the coordinates\' reciben máxima puntuación. Respuestas que confundan la secuencia (por ejemplo, identificar \'go to the stronghold\' como instrucción inmediata en lugar de paso posterior) reciben puntuación parcial.',
        expectedKeywords: ['meet', 'coordinates', '123', '64', '-45', 'stronghold']
    },
    {
        id: 'a1-alto-list-5',
        skillId: 'A1ALTO-LIST-CHEST',
        level: 'A1-alto',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A1_Alto/A1_Alto_Chest.wav',
        text: 'Escucha el audio. ¿Cuál es el problema?',
        options: [
            { text: 'El cofre está cerrado / no pueden abrirlo', isCorrect: true },
            { text: 'El cofre está lleno', isCorrect: false },
            { text: 'Encontraron diamantes en el cofre', isCorrect: false },
            { text: 'El cofre está en el Nether', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar que el problema es que el cofre está cerrado/bloqueado. Frases como \'locked chest\', \'can\'t open\', \'it\'s locked\' o su traducción en español son correctas. Respuestas que indiquen un estado distinto (lleno, contenido) deben recibir puntuación parcial o ninguna.',
        expectedKeywords: ['chest', 'locked', 'can\'t open', 'locked chest']
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
        id: 'a2-list-1',
        skillId: 'A2-LIST-SPAWNER',
        level: 'A2',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A2/A2_spawner.wav',
        text: 'Escucha el audio. ¿Qué encontró el jugador?',
        options: [
            { text: 'Un generador de mobs', isCorrect: true },
            { text: 'Una aldea', isCorrect: false },
            { text: 'Una espada de diamante', isCorrect: false },
            { text: 'Una granja', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar el objeto encontrado en una oración en pasado. \'Spawner\' es la palabra clave.',
        expectedKeywords: ['found', 'spawner', 'cave']
    },
    {
        id: 'a2-list-2',
        skillId: 'A2-LIST-POTIONS',
        level: 'A2',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A2/A2_Dragon.wav',
        text: 'Escucha el audio. ¿Qué necesitas hacer primero?',
        options: [
            { text: 'Preparar pociones', isCorrect: true },
            { text: 'Construir una casa', isCorrect: false },
            { text: 'Minar diamantes', isCorrect: false },
            { text: 'Intercambiar con aldeanos', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar la acción previa en una instrucción con \'before\'. \'Prepare potions\' es la respuesta correcta.',
        expectedKeywords: ['before', 'prepare', 'potions', 'dragon']
    },
    {
        id: 'a2-list-3',
        skillId: 'A2-LIST-DARK',
        level: 'A2',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A2/A2_monsters.wav',
        text: 'Escucha el audio. ¿Qué pasará si oscurece?',
        options: [
            { text: 'Aparecerán monstruos cerca de la aldea', isCorrect: true },
            { text: 'Los aldeanos dormirán', isCorrect: false },
            { text: 'Saldrá el sol', isCorrect: false },
            { text: 'Empezará a llover', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe comprender una oración condicional básica con \'if\'. La consecuencia correcta es que aparecerán monstruos.',
        expectedKeywords: ['if', 'dark', 'monsters', 'spawn', 'village']
    },
    {
        id: 'a2-list-4',
        skillId: 'A2-LIST-BLAZE',
        level: 'A2',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A2/A2_Nether.wav',
        text: 'Escucha el audio. ¿Por qué fue al Nether?',
        options: [
            { text: 'Para conseguir blaze rods', isCorrect: true },
            { text: 'Para construir una casa', isCorrect: false },
            { text: 'Para encontrar aldeanos', isCorrect: false },
            { text: 'Para pescar', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar propósito usando \'to\'. \'To get blaze rods\' es la respuesta esperada.',
        expectedKeywords: ['went', 'nether', 'get', 'blaze rods']
    },
    {
        id: 'a2-list-5',
        skillId: 'A2-LIST-HOUSE',
        level: 'A2',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A2/A2_House.wav',
        text: 'Escucha el audio. ¿Por qué terminaron rápido?',
        options: [
            { text: 'Porque trabajaron juntos', isCorrect: true },
            { text: 'Porque tenían diamantes', isCorrect: false },
            { text: 'Porque era de noche', isCorrect: false },
            { text: 'Porque usaron comandos', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar la causa usando \'because\'. La razón correcta es que trabajaron juntos.',
        expectedKeywords: ['because', 'worked', 'together', 'built']
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
        id: 'a2-alto-list-1',
        skillId: 'A2ALTO-LIST-BRIDGE',
        level: 'A2-alto',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A2_Alto/A2_Alto_bridge.wav',
        text: 'Escucha el audio. ¿Qué pasó mientras construían el puente?',
        options: [
            { text: 'Un esqueleto los atacó', isCorrect: true },
            { text: 'Encontraron diamantes', isCorrect: false },
            { text: 'Terminaron el puente', isCorrect: false },
            { text: 'Empezó a llover', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar una acción interrumpida en pasado continuo + pasado simple. La idea clave es que un esqueleto comenzó a atacar.',
        expectedKeywords: ['building', 'bridge', 'skeleton', 'shooting', 'attacked']
    },
    {
        id: 'a2-alto-list-2',
        skillId: 'A2ALTO-LIST-ARMOR',
        level: 'A2-alto',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A2_Alto/A2_Alto_armor.wav',
        text: 'Escucha el audio. ¿Qué recomienda el jugador?',
        options: [
            { text: 'Usar armadura de hierro', isCorrect: true },
            { text: 'Solo llevar comida', isCorrect: false },
            { text: 'Construir una casa primero', isCorrect: false },
            { text: 'Ir al Nether', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe reconocer una recomendación con \'should\'. La respuesta correcta es usar armadura de hierro.',
        expectedKeywords: ['should', 'wear', 'iron armor', 'cave']
    },
    {
        id: 'a2-alto-list-3',
        skillId: 'A2ALTO-LIST-BIOME',
        level: 'A2-alto',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A2_Alto/A2_Alto_biome.wav',
        text: 'Escucha el audio. ¿Por qué necesitan ropa abrigadora?',
        options: [
            { text: 'Porque el bioma es más frío', isCorrect: true },
            { text: 'Porque está lloviendo', isCorrect: false },
            { text: 'Porque hay monstruos', isCorrect: false },
            { text: 'Porque están minando', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar causa usando comparativos y \'so\'. La razón es que el bioma es más frío.',
        expectedKeywords: ['colder', 'biome', 'forest', 'warm', 'clothes']
    },
    {
        id: 'a2-alto-list-4',
        skillId: 'A2ALTO-LIST-VILLAGE',
        level: 'A2-alto',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A2_Alto/A2_Alto_trade.wav',
        text: 'Escucha el audio. ¿Qué pueden hacer si encuentran una aldea?',
        options: [
            { text: 'Intercambiar por comida', isCorrect: true },
            { text: 'Pelear con aldeanos', isCorrect: false },
            { text: 'Construir un portal', isCorrect: false },
            { text: 'Minar diamantes', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe comprender una oración condicional con \'if\' y \'can\'. La acción correcta es intercambiar por comida.',
        expectedKeywords: ['if', 'find', 'village', 'trade', 'food']
    },
    {
        id: 'a2-alto-list-5',
        skillId: 'A2ALTO-LIST-BOW',
        level: 'A2-alto',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A2_Alto/A2_Alto_Bow.wav',
        text: 'Escucha el audio. ¿Por qué prefiere el arco?',
        options: [
            { text: 'Porque es más seguro', isCorrect: true },
            { text: 'Porque es más barato', isCorrect: false },
            { text: 'Porque es más rápido', isCorrect: false },
            { text: 'Porque es más fuerte', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar una preferencia con justificación. La razón correcta es que el arco es más seguro.',
        expectedKeywords: ['prefer', 'bow', 'safer', 'sword', 'because']
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
        id: 'b1-list-1',
        skillId: 'B1-LIST-FOOD',
        level: 'B1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/B1/B1_food.wav',
        text: 'Escucha el audio. ¿Por qué tuvieron que cazar animales?',
        options: [
            { text: 'Porque se quedaron sin comida', isCorrect: true },
            { text: 'Porque querían recursos', isCorrect: false },
            { text: 'Porque los animales los atacaron', isCorrect: false },
            { text: 'Porque era de día', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar causa y consecuencia en una oración más compleja. La razón correcta es que se quedaron sin comida.',
        expectedKeywords: ['ran out', 'food', 'hunt', 'animals', 'night']
    },
    {
        id: 'b1-list-2',
        skillId: 'B1-LIST-TORCHES',
        level: 'B1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/B1/B1_torches.wav',
        text: 'Escucha el audio. ¿Qué problema tuvieron?',
        options: [
            { text: 'Se perdieron en la cueva', isCorrect: true },
            { text: 'Se quedaron sin herramientas', isCorrect: false },
            { text: 'Encontraron diamantes', isCorrect: false },
            { text: 'Construyeron una casa', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe comprender una condicional en pasado (third conditional básica). El problema fue perderse en la cueva.',
        expectedKeywords: ['torches', 'lost', 'cave', 'brought']
    },
    {
        id: 'b1-list-3',
        skillId: 'B1-LIST-PLAN-CHANGE',
        level: 'B1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/B1/B1_plan.wav',
        text: 'Escucha el audio. ¿Por qué cambiaron el plan?',
        options: [
            { text: 'Porque estaba tomando demasiado tiempo', isCorrect: true },
            { text: 'Porque no tenían materiales', isCorrect: false },
            { text: 'Porque los aldeanos se fueron', isCorrect: false },
            { text: 'Porque los monstruos atacaron', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar la razón del cambio de plan en un discurso más largo. La clave es \'taking too long\'.',
        expectedKeywords: ['plan', 'build', 'wall', 'changed', 'too long']
    },
    {
        id: 'b1-list-4',
        skillId: 'B1-LIST-OPTIONS',
        level: 'B1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/B1/B1_explore.wav',
        text: 'Escucha el audio. ¿Qué opciones tienen?',
        options: [
            { text: 'Explorar la cueva o proteger la base', isCorrect: true },
            { text: 'Construir una casa o intercambiar', isCorrect: false },
            { text: 'Pelear o huir', isCorrect: false },
            { text: 'Minar o cultivar', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar opciones dadas con \'either...or\'. La respuesta correcta incluye ambas opciones mencionadas.',
        expectedKeywords: ['either', 'explore', 'cave', 'protect', 'base']
    },
    {
        id: 'b1-list-5',
        skillId: 'B1-LIST-LOOT',
        level: 'B1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/B1/B1_boss.wav',
        text: 'Escucha el audio. ¿Qué hicieron después de derrotar al jefe?',
        options: [
            { text: 'Recogieron el botín y regresaron a la base', isCorrect: true },
            { text: 'Empezaron una nueva misión', isCorrect: false },
            { text: 'Construyeron una granja', isCorrect: false },
            { text: 'Exploraron el Nether', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar secuencia de acciones en pasado. La respuesta correcta incluye recolectar botín y regresar.',
        expectedKeywords: ['after', 'defeated', 'boss', 'loot', 'returned']
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
    {
        id: 'pre-a1-list-1',
        skillId: 'PREA1-LIST-COW',
        level: 'Pre-A1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/Pre_A1/Pre_A1_Cow.wav',
        text: '¿Qué palabra escuchas en el audio?',
        options: [
            { text: 'Vaca', isCorrect: true },
            { text: 'Zombie', isCorrect: false },
            { text: 'Árbol', isCorrect: false },
            { text: 'Piedra', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar la palabra básica \'cow\'. Se acepta selección directa. No se espera producción de lenguaje.',
        expectedKeywords: ['cow']
    },
    {
        id: 'pre-a1-list-2',
        skillId: 'PREA1-LIST-JUMP',
        level: 'Pre-A1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/Pre_A1/Pre_A1_Jump.wav',
        text: '¿Qué palabra escuchas en el audio?',
        options: [
            { text: 'Saltar', isCorrect: true },
            { text: 'Dormir', isCorrect: false },
            { text: 'Comer', isCorrect: false },
            { text: 'Minar', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce una instrucción básica (verbo de acción). Respuesta correcta si identifica \'jump\' como acción.',
        expectedKeywords: ['jump']
    },
    {
        id: 'pre-a1-list-3',
        skillId: 'PREA1-LIST-DIAMOND',
        level: 'Pre-A1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/Pre_A1/Pre_A1_Diamond.wav',
        text: '¿Qué palabra escuchas en el audio?',
        options: [
            { text: 'Diamante', isCorrect: true },
            { text: 'Madera', isCorrect: false },
            { text: 'Agua', isCorrect: false },
            { text: 'Arena', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe reconocer vocabulario básico de objetos en Minecraft. \'Diamond\' es la respuesta esperada.',
        expectedKeywords: ['diamond']
    },
    {
        id: 'pre-a1-list-4',
        skillId: 'PREA1-LIST-HOUSE',
        level: 'Pre-A1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/Pre_A1/Pre_A1_House.wav',
        text: '¿Qué palabra escuchas en el audio?',
        options: [
            { text: 'Casa', isCorrect: true },
            { text: 'Cueva', isCorrect: false },
            { text: 'Bosque', isCorrect: false },
            { text: 'Río', isCorrect: false }
        ],
        gradingRubric: 'El alumno identifica una instrucción simple con destino. Debe reconocer \'house\'.',
        expectedKeywords: ['house', 'go']
    },
    {
        id: 'pre-a1-list-5',
        skillId: 'PREA1-LIST-ZOMBIE',
        level: 'Pre-A1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/Pre_A1/Pre_A1_Zombie.wav',
        text: '¿Qué palabra escuchas en el audio?',
        options: [
            { text: 'Zombie', isCorrect: true },
            { text: 'Oveja', isCorrect: false },
            { text: 'Cerdo', isCorrect: false },
            { text: 'Aldeano', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce una palabra clave de enemigo en Minecraft. \'Zombie\' es la respuesta correcta.',
        expectedKeywords: ['zombie']
    },
    { id: 'pre-a1-ext-3', skillId: 'PREA1-VISUAL-DIRT', level: 'Pre-A1', category: 'Identificación Visual', type: 'image-choice', text: 'Identifica el bloque de tierra (Dirt):', options: [{ text: 'Dirt', isCorrect: true, imageUrl: '/images/placeholders/dirt.png' }, { text: 'Stone', isCorrect: false, imageUrl: '/images/placeholders/stone.png' }] },
    { id: 'pre-a1-ext-4', skillId: 'PREA1-ORAL-JUMP', level: 'Pre-A1', category: 'Producción Oral', type: 'audio-record', text: 'Di en voz alta la acción de "Saltar" en inglés ("Jump").', gradingRubric: 'El alumno pronuncia claramente la palabra jump o algo similar.', expectedKeywords: ['jump'] },
    { id: 'pre-a1-ext-5', skillId: 'PREA1-WRITTEN-RUN', level: 'Pre-A1', category: 'Producción Escrita', type: 'text-input', text: 'Escribe la palabra para "Correr" en inglés.', gradingRubric: 'Debe escribir run', expectedKeywords: ['run'] },

    // A1 Nuevas
    { id: 'a1-ext-1', skillId: 'A1-GRAMMAR-LIKE', level: 'A1', category: 'Gramática y Vocabulario', type: 'multiple-choice', text: 'Quieres decir "Me gustan las manzanas".', options: [{ text: 'I like apples.', isCorrect: true }, { text: 'I likes apples.', isCorrect: false }] },
    {
        id: 'a1-list-2',
        skillId: 'A1-LIST-CREEPER',
        level: 'A1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A1/A1_Creeper.wav',
        text: 'Escucha el audio. ¿Dónde está el creeper?',
        options: [
            { text: 'Junto al árbol', isCorrect: true },
            { text: 'Dentro de la casa', isCorrect: false },
            { text: 'Debajo del agua', isCorrect: false },
            { text: 'En la montaña', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar la ubicación usando preposiciones básicas. \'Next to the tree\' es la respuesta esperada.',
        expectedKeywords: ['creeper', 'next to', 'tree']
    },
    {
        id: 'a1-list-3',
        skillId: 'A1-LIST-SWORD',
        level: 'A1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A1/A1_Chest.wav',
        text: 'Escucha el audio. ¿Qué debes tomar?',
        options: [
            { text: 'La espada', isCorrect: true },
            { text: 'El pico', isCorrect: false },
            { text: 'La manzana', isCorrect: false },
            { text: 'El mapa', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar el objeto indicado en una instrucción simple. \'Sword\' es la palabra clave.',
        expectedKeywords: ['open', 'chest', 'sword', 'take']
    },
    {
        id: 'a1-list-4',
        skillId: 'A1-LIST-SHEEP',
        level: 'A1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A1/A1_Sheep.wav',
        text: 'Escucha el audio. ¿Cuántas ovejas hay?',
        options: [
            { text: 'Tres', isCorrect: true },
            { text: 'Uno', isCorrect: false },
            { text: 'Cinco', isCorrect: false },
            { text: 'Diez', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar números básicos dentro de una oración. \'Three\' es la respuesta correcta.',
        expectedKeywords: ['three', 'sheep', 'river']
    },
    {
        id: 'a1-list-5',
        skillId: 'A1-LIST-FARM',
        level: 'A1',
        category: 'Comprensión Auditiva',
        type: 'audio-listening',
        audioUrl: '/audios/evaluacion/A1/A1_Farm.wav',
        text: 'Escucha el audio. ¿Qué están haciendo?',
        options: [
            { text: 'Construyendo una granja', isCorrect: true },
            { text: 'Explorando una cueva', isCorrect: false },
            { text: 'Peleando con monstruos', isCorrect: false },
            { text: 'Intercambiando con aldeanos', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe reconocer una acción en presente continuo. \'Building a farm\' es la respuesta esperada.',
        expectedKeywords: ['building', 'farm', 'we']
    },
    { id: 'a1-ext-3', skillId: 'A1-WRITTEN-GREET', level: 'A1', category: 'Producción Escrita', type: 'text-input', text: 'Entras al servidor. Escribe un saludo básico a todos.', gradingRubric: 'Mensaje de saludo como "Hi everyone" o "Hello guys".' },
    { id: 'a1-ext-4', skillId: 'A1-VISUAL-COW', level: 'A1', category: 'Identificación Visual', type: 'image-choice', text: 'Encuentra a la vaca (Cow):', options: [{ text: 'Cow', isCorrect: true, imageUrl: '/images/placeholders/cow.png' }, { text: 'Pig', isCorrect: false, imageUrl: '/images/placeholders/pig.png' }] },
    { id: 'a1-ext-5', skillId: 'A1-ORAL-NUMBERS', level: 'A1', category: 'Producción Oral', type: 'audio-record', text: 'Tienes 5 bloques. Di en inglés "Tengo cinco bloques".', gradingRubric: 'Pronunciación de "I have five blocks".' },

    // A1-alto Nuevas
    { id: 'a1-alto-ext-1', skillId: 'A1ALTO-VISUAL-BED', level: 'A1-alto', category: 'Identificación Visual', type: 'image-choice', text: '¿Qué objeto usas para dormir y saltarte la noche?', options: [{ text: 'Bed', isCorrect: true, imageUrl: '/images/placeholders/bed.png' }, { text: 'Slab', isCorrect: false, imageUrl: '/images/placeholders/slab.png' }] },
    { id: 'a1-alto-ext-2', skillId: 'A1ALTO-VISUAL-APPLE', level: 'A1-alto', category: 'Identificación Visual', type: 'image-choice', text: 'Selecciona una Manzana Dorada (Golden Apple):', options: [{ text: 'Golden Apple', isCorrect: true, imageUrl: '/images/placeholders/gapple.png' }, { text: 'Carrot', isCorrect: false, imageUrl: '/images/placeholders/carrot.png' }] },
    { id: 'a1-alto-ext-3', skillId: 'A1ALTO-WRITTEN-NEED', level: 'A1-alto', category: 'Producción Escrita', type: 'text-input', text: 'Escribe en el chat que "necesitas comida".', gradingRubric: 'El alumno pide comida usando "need food" o "I am hungry".' },
    { id: 'a1-alto-ext-5', skillId: 'A1ALTO-ORAL-WHERE', level: 'A1-alto', category: 'Producción Oral', type: 'audio-record', text: 'Pregúntale en voz alta a un amigo "¿Dónde estás?".', gradingRubric: 'Hacer la pregunta de ubicación en inglés simple.' },

    // A2 Nuevas
    { id: 'a2-ext-1', skillId: 'A2-VISUAL-NETHER', level: 'A2', category: 'Identificación Visual', type: 'image-choice', text: 'Identifica un portal al Nether.', options: [{ text: 'Nether Portal', isCorrect: true, imageUrl: '/images/placeholders/portal.png' }, { text: 'End Portal', isCorrect: false, imageUrl: '/images/placeholders/endportal.png' }] },
    { id: 'a2-ext-2', skillId: 'A2-VISUAL-BOAT', level: 'A2', category: 'Identificación Visual', type: 'image-choice', text: 'Identifica el Bote (Boat).', options: [{ text: 'Boat', isCorrect: true, imageUrl: '/images/placeholders/boat.png' }, { text: 'Minecart', isCorrect: false, imageUrl: '/images/placeholders/minecart.png' }] },

    { id: 'a2-ext-4', skillId: 'A2-WRITTEN-INVITE', level: 'A2', category: 'Producción Escrita', type: 'text-input', text: 'Invita textualmente a un jugador a unirse a tu facción/equipo.', gradingRubric: 'Debe contener una oferta o invitación ("Join my team", "Do you want to play with us?").' },
    { id: 'a2-ext-5', skillId: 'A2-ORAL-WARN2', level: 'A2', category: 'Producción Oral', type: 'audio-record', text: 'Graba en voz alta aconsejando a tu amigo: "No deberías cavar directamente hacia abajo" ("You shouldn\'t dig straight down").', gradingRubric: 'El alumno debe dar el famoso consejo de Minecraft usando un modal o imperativo de no hacerlo.' },

    // A2-alto Nuevas
    { id: 'a2-alto-ext-1', skillId: 'A2ALTO-GRAMMAR-SINCE', level: 'A2-alto', category: 'Gramática y Vocabulario', type: 'multiple-choice', text: 'Quiero decir que he jugado este servidor desde 2021.', options: [{ text: 'I have played on this server since 2021.', isCorrect: true }, { text: 'I have played on this server for 2021.', isCorrect: false }] },

    { id: 'a2-alto-ext-3', skillId: 'A2ALTO-WRITTEN-APOLOGY', level: 'A2-alto', category: 'Producción Escrita', type: 'text-input', text: 'Mataste a un compañero de equipo por accidente y tomó tu flecha. Escribe disculpándote y explicando que fue un accidente.', gradingRubric: 'Debe disculparse ("I am sorry", "My fault") y excusarse ("It was an accident", "I didn\'t mean to").' },
    { id: 'a2-alto-ext-4', skillId: 'A2ALTO-VISUAL-TRIPWIRE', level: 'A2-alto', category: 'Identificación Visual', type: 'image-choice', text: 'Identifica el mecanismo o la trampa de "Tripwire Hook".', options: [{ text: 'Tripwire', isCorrect: true, imageUrl: '/images/placeholders/tripwire.png' }, { text: 'Lever', isCorrect: false, imageUrl: '/images/placeholders/lever.png' }] },
    { id: 'a2-alto-ext-5', skillId: 'A2ALTO-ORAL-EXCUSE', level: 'A2-alto', category: 'Producción Oral', type: 'audio-record', text: 'Explica en voz alta por qué no pudiste defender la base: "Había demasiados zombies y no tenía espada".', gradingRubric: 'Usar "there were too many" o similar para explicar la desventaja.' },

    // B1 Nuevas

    { id: 'b1-ext-3', skillId: 'B1-VISUAL-BEACON', level: 'B1', category: 'Identificación Visual', type: 'image-choice', text: 'Identifica un Beacon (Faro mágico) activado.', options: [{ text: 'Beacon', isCorrect: true, imageUrl: '/images/placeholders/beacon.png' }, { text: 'Conduit', isCorrect: false, imageUrl: '/images/placeholders/conduit.png' }] },
    { id: 'b1-ext-4', skillId: 'B1-VISUAL-REDSTONE', level: 'B1', category: 'Identificación Visual', type: 'image-choice', text: 'Identifica un circuito de reloj (Redstone Clock).', options: [{ text: 'Redstone Clock', isCorrect: true, imageUrl: '/images/placeholders/redstone_clock.png' }, { text: 'Piston Door', isCorrect: false, imageUrl: '/images/placeholders/piston_door.png' }] },
    { id: 'b1-ext-5', skillId: 'B1-WRITTEN-APPEAL', level: 'B1', category: 'Producción Escrita', type: 'text-input', text: 'Te banearon injustamente. Redacta un mensaje para apelar justificando que fue un lag (retraso en tu conexión).', gradingRubric: 'Debe formular una queja o apelación educada usando conector causal (because, due to) justificándose con lag/connection.' },
    { id: 'b1-ext-6', skillId: 'B1-ORAL-PERSUADE', level: 'B1', category: 'Producción Oral', type: 'audio-record', text: 'Convence verbalmente a tu clan de ir a asaltar un Templo Oceánico esta noche argumentando que dará buenos materiales.', gradingRubric: 'Debe contener expresiones persuasivas (We should, Let\'s go, It will be worth it) y prometer beneficios.' }
];
