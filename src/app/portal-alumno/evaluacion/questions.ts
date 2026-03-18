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
        id: 'pre-a1-gv-1',
        skillId: 'PREA1-VOCAB-PICKAXE',
        level: 'Pre-A1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: '¿Cuál es "pico" en Minecraft?',
        options: [
            { text: 'Pickaxe', isCorrect: true },
            { text: 'Sword', isCorrect: false },
            { text: 'Apple', isCorrect: false },
            { text: 'Door', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce vocabulario básico de objetos. \'Pickaxe\' es la respuesta correcta.',
        expectedKeywords: ['pickaxe']
    },
    {
        id: 'pre-a1-gv-2',
        skillId: 'PREA1-VOCAB-COW',
        level: 'Pre-A1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "This is a " (imagen de una vaca).',
        options: [
            { text: 'Cow', isCorrect: true },
            { text: 'Zombie', isCorrect: false },
            { text: 'Tree', isCorrect: false },
            { text: 'Stone', isCorrect: false }
        ],
        gradingRubric: 'El alumno identifica vocabulario básico de animales. \'Cow\' es correcto.',
        expectedKeywords: ['cow']
    },
    {
        id: 'pre-a1-gv-3',
        skillId: 'PREA1-VOCAB-WOOD',
        level: 'Pre-A1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: '¿Cuál es "madera" en Minecraft?',
        options: [
            { text: 'Wood', isCorrect: true },
            { text: 'Water', isCorrect: false },
            { text: 'Iron', isCorrect: false },
            { text: 'Sand', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce materiales básicos. \'Wood\' es la respuesta correcta.',
        expectedKeywords: ['wood']
    },
    {
        id: 'pre-a1-gv-4',
        skillId: 'PREA1-VOCAB-ZOMBIE-G',
        level: 'Pre-A1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "I see a " (imagen de un zombie).',
        options: [
            { text: 'Zombie', isCorrect: true },
            { text: 'Sheep', isCorrect: false },
            { text: 'Pig', isCorrect: false },
            { text: 'Villager', isCorrect: false }
        ],
        gradingRubric: 'El alumno identifica vocabulario básico de enemigos. \'Zombie\' es correcto.',
        expectedKeywords: ['zombie']
    },
    {
        id: 'pre-a1-gv-5',
        skillId: 'PREA1-VOCAB-DOOR',
        level: 'Pre-A1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: '¿Cuál es "puerta" en Minecraft?',
        options: [
            { text: 'Door', isCorrect: true },
            { text: 'Chest', isCorrect: false },
            { text: 'Table', isCorrect: false },
            { text: 'Torch', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce objetos básicos del entorno. \'Door\' es la respuesta correcta.',
        expectedKeywords: ['door']
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
        id: 'a1-gv-1',
        skillId: 'A1-GRAMMAR-BE-AM',
        level: 'A1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa la oración: "I  mining in a cave."',
        options: [
            { text: 'am', isCorrect: true },
            { text: 'is', isCorrect: false },
            { text: 'are', isCorrect: false },
            { text: 'be', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe identificar la forma correcta del verbo \'to be\' con \'I\' en presente continuo. \'am\' es la respuesta correcta.',
        expectedKeywords: ['I am', 'mining']
    },
    {
        id: 'a1-gv-2',
        skillId: 'A1-GRAMMAR-BE-IS',
        level: 'A1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Elige la opción correcta: "The creeper  next to the tree."',
        options: [
            { text: 'is', isCorrect: true },
            { text: 'are', isCorrect: false },
            { text: 'am', isCorrect: false },
            { text: 'be', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe usar correctamente \'is\' para tercera persona singular.',
        expectedKeywords: ['creeper', 'is', 'tree']
    },
    {
        id: 'a1-gv-3',
        skillId: 'A1-VOCAB-PLURAL-SHEEP',
        level: 'A1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: '¿Cuál es el plural correcto? "One sheep → Two "',
        options: [
            { text: 'sheep', isCorrect: true },
            { text: 'sheeps', isCorrect: false },
            { text: 'sheepes', isCorrect: false },
            { text: 'sheepen', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce plurales irregulares básicos. \'sheep\' no cambia en plural.',
        expectedKeywords: ['sheep', 'plural']
    },
    {
        id: 'a1-gv-4',
        skillId: 'A1-GRAMMAR-THERE-ARE',
        level: 'A1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "There  three zombies near the village."',
        options: [
            { text: 'are', isCorrect: true },
            { text: 'is', isCorrect: false },
            { text: 'am', isCorrect: false },
            { text: 'be', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe usar \'there are\' para plural.',
        expectedKeywords: ['there are', 'zombies', 'three']
    },
    {
        id: 'a1-gv-5',
        skillId: 'A1-GRAMMAR-NOUN-ADJECTIVE',
        level: 'A1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Elige la opción correcta: "I have a ___ sword."',
        options: [
            { text: 'diamond', isCorrect: true },
            { text: 'diamonds', isCorrect: false },
            { text: 'diamondes', isCorrect: false },
            { text: 'diamonding', isCorrect: false }
        ],
        gradingRubric: 'El alumno debe usar correctamente el sustantivo como adjetivo. \'diamond sword\' es correcto.',
        expectedKeywords: ['diamond', 'sword']
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
        id: 'a1-alto-gv-1',
        skillId: 'A1ALTO-GRAMMAR-HAVE',
        level: 'A1-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "I  a house near the river."',
        options: [
            { text: 'have', isCorrect: true },
            { text: 'has', isCorrect: false },
            { text: 'having', isCorrect: false },
            { text: 'haves', isCorrect: false }
        ],
        gradingRubric: 'El alumno usa correctamente \'have\' con \'I\'.',
        expectedKeywords: ['have', 'house', 'river']
    },
    {
        id: 'a1-alto-gv-2',
        skillId: 'A1ALTO-GRAMMAR-BE-HE',
        level: 'A1-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Elige la opción correcta: "He  mining diamonds."',
        options: [
            { text: 'is', isCorrect: true },
            { text: 'are', isCorrect: false },
            { text: 'am', isCorrect: false },
            { text: 'be', isCorrect: false }
        ],
        gradingRubric: 'El alumno identifica la forma correcta de \'to be\' con tercera persona singular en presente continuo.',
        expectedKeywords: ['he is', 'mining', 'diamonds']
    },
    {
        id: 'a1-alto-gv-3',
        skillId: 'A1ALTO-GRAMMAR-PREP-IN',
        level: 'A1-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "There is a chest  the house."',
        options: [
            { text: 'in', isCorrect: true },
            { text: 'on', isCorrect: false },
            { text: 'at', isCorrect: false },
            { text: 'to', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce preposiciones básicas de lugar. \'in the house\' es correcto.',
        expectedKeywords: ['in', 'chest', 'house']
    },
    {
        id: 'a1-alto-gv-4',
        skillId: 'A1ALTO-GRAMMAR-CAN',
        level: 'A1-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Elige la opción correcta: "We  build a farm."',
        options: [
            { text: 'can', isCorrect: true },
            { text: 'is', isCorrect: false },
            { text: 'are', isCorrect: false },
            { text: 'has', isCorrect: false }
        ],
        gradingRubric: 'El alumno identifica el uso básico del modal \'can\' para habilidad o posibilidad.',
        expectedKeywords: ['can', 'build', 'farm']
    },
    {
        id: 'a1-alto-gv-5',
        skillId: 'A1ALTO-GRAMMAR-COMPARATIVE-BIGGER',
        level: 'A1-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "The zombie is ___ than the sheep."',
        options: [
            { text: 'bigger', isCorrect: true },
            { text: 'big', isCorrect: false },
            { text: 'biggest', isCorrect: false },
            { text: 'more big', isCorrect: false }
        ],
        gradingRubric: 'El alumno usa comparativos básicos correctamente (\'bigger than\').',
        expectedKeywords: ['bigger', 'than', 'zombie', 'sheep']
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
        id: 'a2-gv-1',
        skillId: 'A2-GRAMMAR-PAST-FOUND',
        level: 'A2',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "Yesterday, I  diamonds in a cave."',
        options: [
            { text: 'found', isCorrect: true },
            { text: 'find', isCorrect: false },
            { text: 'finding', isCorrect: false },
            { text: 'finded', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce pasado simple de verbos irregulares. \'found\' es correcto.',
        expectedKeywords: ['yesterday', 'found', 'diamonds']
    },
    {
        id: 'a2-gv-2',
        skillId: 'A2-GRAMMAR-CONDITION-GETS',
        level: 'A2',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Elige la opción correcta: "If it  dark, monsters spawn."',
        options: [
            { text: 'gets', isCorrect: true },
            { text: 'get', isCorrect: false },
            { text: 'got', isCorrect: false },
            { text: 'getting', isCorrect: false }
        ],
        gradingRubric: 'El alumno usa correctamente presente simple en condicional tipo 1.',
        expectedKeywords: ['if', 'gets', 'dark', 'monsters']
    },
    {
        id: 'a2-gv-3',
        skillId: 'A2-GRAMMAR-PURPOSE-TO',
        level: 'A2',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "I went to the village  buy food."',
        options: [
            { text: 'to', isCorrect: true },
            { text: 'for', isCorrect: false },
            { text: 'at', isCorrect: false },
            { text: 'with', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce el uso de \'to\' para expresar propósito.',
        expectedKeywords: ['to', 'buy', 'food', 'village']
    },
    {
        id: 'a2-gv-4',
        skillId: 'A2-GRAMMAR-COMPARATIVE-STRONGER',
        level: 'A2',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Elige la opción correcta: "This sword is  than the wooden one."',
        options: [
            { text: 'stronger', isCorrect: true },
            { text: 'strong', isCorrect: false },
            { text: 'strongest', isCorrect: false },
            { text: 'more strong', isCorrect: false }
        ],
        gradingRubric: 'El alumno usa comparativos correctamente.',
        expectedKeywords: ['stronger', 'than', 'sword']
    },
    {
        id: 'a2-gv-5',
        skillId: 'A2-GRAMMAR-MODAL-MUST',
        level: 'A2',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "We ___ build a wall to protect the village."',
        options: [
            { text: 'must', isCorrect: true },
            { text: 'am', isCorrect: false },
            { text: 'is', isCorrect: false },
            { text: 'has', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce el uso de \'must\' para obligación.',
        expectedKeywords: ['must', 'build', 'wall', 'protect']
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
            { text: 'Para conseguir varas de blaze', isCorrect: true },
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
        id: 'a2-alto-gv-1',
        skillId: 'A2ALTO-GRAMMAR-PAST-CONT',
        level: 'A2-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "While I  mining, I found diamonds."',
        options: [
            { text: 'was', isCorrect: true },
            { text: 'am', isCorrect: false },
            { text: 'were', isCorrect: false },
            { text: 'be', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce pasado continuo con \'while\'. \'was mining\' es correcto.',
        expectedKeywords: ['while', 'was', 'mining', 'found']
    },
    {
        id: 'a2-alto-gv-2',
        skillId: 'A2ALTO-GRAMMAR-SHOULD-REC',
        level: 'A2-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Elige la opción correcta: "You  bring food before exploring the cave."',
        options: [
            { text: 'should', isCorrect: true },
            { text: 'are', isCorrect: false },
            { text: 'have', isCorrect: false },
            { text: 'do', isCorrect: false }
        ],
        gradingRubric: 'El alumno identifica el uso de \'should\' para dar recomendaciones.',
        expectedKeywords: ['should', 'bring', 'food', 'cave']
    },
    {
        id: 'a2-alto-gv-3',
        skillId: 'A2ALTO-GRAMMAR-COMPARATIVE-COLDER',
        level: 'A2-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "This biome is  than the desert."',
        options: [
            { text: 'colder', isCorrect: true },
            { text: 'cold', isCorrect: false },
            { text: 'coldest', isCorrect: false },
            { text: 'more cold', isCorrect: false }
        ],
        gradingRubric: 'El alumno usa comparativos correctamente.',
        expectedKeywords: ['colder', 'biome', 'desert']
    },
    {
        id: 'a2-alto-gv-4',
        skillId: 'A2ALTO-GRAMMAR-CONDITION-FIND',
        level: 'A2-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "If we  a village, we can trade."',
        options: [
            { text: 'find', isCorrect: true },
            { text: 'found', isCorrect: false },
            { text: 'finding', isCorrect: false },
            { text: 'finds', isCorrect: false }
        ],
        gradingRubric: 'El alumno usa correctamente presente simple en condicional tipo 1.',
        expectedKeywords: ['if', 'find', 'village', 'trade']
    },
    {
        id: 'a2-alto-gv-5',
        skillId: 'A2ALTO-GRAMMAR-GERUND-PREFER',
        level: 'A2-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Elige la opción correcta: "I prefer ___ with a bow."',
        options: [
            { text: 'fighting', isCorrect: true },
            { text: 'fight', isCorrect: false },
            { text: 'fought', isCorrect: false },
            { text: 'to fighted', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce el uso de gerundio después de \'prefer\'.',
        expectedKeywords: ['prefer', 'fighting', 'bow']
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
        id: 'b1-gv-1',
        skillId: 'B1-GRAMMAR-SECOND-COND',
        level: 'B1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "If I  more diamonds, I would craft better armor."',
        options: [
            { text: 'had', isCorrect: true },
            { text: 'have', isCorrect: false },
            { text: 'will have', isCorrect: false },
            { text: 'having', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce el segundo condicional (if + past simple, would). \'had\' es correcto.',
        expectedKeywords: ['if', 'had', 'diamonds', 'would']
    },
    {
        id: 'b1-gv-2',
        skillId: 'B1-GRAMMAR-PRES-PERF-NEVER',
        level: 'B1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Elige la opción correcta: "I have never  the Ender Dragon."',
        options: [
            { text: 'defeated', isCorrect: true },
            { text: 'defeat', isCorrect: false },
            { text: 'defeating', isCorrect: false },
            { text: 'defeats', isCorrect: false }
        ],
        gradingRubric: 'El alumno usa correctamente el present perfect con \'have never\'.',
        expectedKeywords: ['have never', 'defeated', 'dragon']
    },
    {
        id: 'b1-gv-3',
        skillId: 'B1-GRAMMAR-PASSIVE-BUILT',
        level: 'B1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "The house  by the team yesterday."',
        options: [
            { text: 'was built', isCorrect: true },
            { text: 'built', isCorrect: false },
            { text: 'was build', isCorrect: false },
            { text: 'is built', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce la voz pasiva en pasado simple. \'was built\' es correcto.',
        expectedKeywords: ['was built', 'house', 'yesterday']
    },
    {
        id: 'b1-gv-4',
        skillId: 'B1-GRAMMAR-GERUND-STOP',
        level: 'B1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Elige la opción correcta: "We stopped  because it was getting dark."',
        options: [
            { text: 'exploring', isCorrect: true },
            { text: 'explore', isCorrect: false },
            { text: 'explored', isCorrect: false },
            { text: 'to explore', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce el uso de gerundio después de \'stop\' cuando indica interrupción de una actividad.',
        expectedKeywords: ['stopped', 'exploring', 'dark']
    },
    {
        id: 'b1-gv-5',
        skillId: 'B1-GRAMMAR-SHOULD-HAVE',
        level: 'B1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "You got hurt. You ___ have used a shield to protect yourself."',
        options: [
            { text: 'should', isCorrect: true },
            { text: 'can', isCorrect: false },
            { text: 'must', isCorrect: false },
            { text: 'will', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce el uso de \'should have\' para dar recomendaciones en el pasado.',
        expectedKeywords: ['should have', 'shield', 'protect']
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
        id: 'b1-4',
        skillId: 'B1-ORAL-NEGOTIATE',
        level: 'B1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Graba un audio negociando pacíficamente una disputa de territorio con otro jugador.',
        gradingRubric: 'El lenguaje debe ser respetuoso, ofrecer compromisos o condicionales asertivos.',
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
            { text: 'Ve a la casa', isCorrect: true },
            { text: 'Ve a la cueva', isCorrect: false },
            { text: 'Ve al bosque', isCorrect: false },
            { text: 'Ve al río', isCorrect: false }
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
        text: 'Escucha el audio. ¿Qué debes tomar del cofre?',
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
