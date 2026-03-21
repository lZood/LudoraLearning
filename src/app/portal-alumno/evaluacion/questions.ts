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
        id: 'pre-a1-po-1',
        skillId: 'PREA1-ORAL-FIVE-BLOCKS',
        level: 'Pre-A1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “cinco bloques”.',
        gradingRubric: 'La IA debe evaluar que el alumno pronuncie claramente \'five blocks\'. Se valora claridad y pronunciación básica.',
        expectedKeywords: ['five', 'blocks']
    },
    {
        id: 'pre-a1-po-2',
        skillId: 'PREA1-ORAL-COW',
        level: 'Pre-A1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “vaca”.',
        gradingRubric: 'La IA debe evaluar que el alumno pronuncie correctamente \'cow\'. Se valora claridad.',
        expectedKeywords: ['cow']
    },
    {
        id: 'pre-a1-po-3',
        skillId: 'PREA1-ORAL-RED',
        level: 'Pre-A1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés el color “rojo”.',
        gradingRubric: 'La IA debe evaluar que el alumno diga correctamente un color básico en inglés. Se espera \'red\' con pronunciación clara.',
        expectedKeywords: ['red']
    },
    {
        id: 'pre-a1-po-4',
        skillId: 'PREA1-ORAL-HUNGRY',
        level: 'Pre-A1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “hambre”.',
        gradingRubric: 'La IA debe evaluar que el alumno pronuncie correctamente \'hungry\'.',
        expectedKeywords: ['hungry']
    },
    {
        id: 'pre-a1-po-5',
        skillId: 'PREA1-ORAL-JUMP',
        level: 'Pre-A1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “saltar”.',
        gradingRubric: 'La IA debe evaluar que el alumno pronuncie correctamente \'jump\'.',
        expectedKeywords: ['jump']
    },
    {
        id: 'pre-a1-pe-1',
        skillId: 'PREA1-WRITTEN-COW',
        level: 'Pre-A1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Escribe la palabra en inglés: "vaca"',
        gradingRubric: 'El alumno debe escribir la palabra básica \'cow\'. Se acepta mayúscula o minúscula. Errores menores de ortografía no son aceptables en este nivel.',
        expectedKeywords: ['cow']
    },
    {
        id: 'pre-a1-pe-2',
        skillId: 'PREA1-WRITTEN-RED',
        level: 'Pre-A1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Escribe en inglés: "rojo"',
        gradingRubric: 'El alumno debe escribir \'red\'. Se acepta mayúscula o minúscula; no se aceptan traducciones alternativas.',
        expectedKeywords: ['red']
    },
    {
        id: 'pre-a1-pe-3',
        skillId: 'PREA1-WRITTEN-WATER',
        level: 'Pre-A1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Escribe en inglés: "agua"',
        gradingRubric: 'El alumno debe escribir \'water\'. Se acepta mayúscula o minúscula, pero no errores ortográficos.',
        expectedKeywords: ['water']
    },
    {
        id: 'pre-a1-pe-4',
        skillId: 'PREA1-WRITTEN-SHEEP',
        level: 'Pre-A1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Escribe en inglés: "oveja"',
        gradingRubric: 'El alumno debe escribir \'sheep\'. Se acepta mayúscula o minúscula.',
        expectedKeywords: ['sheep']
    },
    {
        id: 'pre-a1-pe-5',
        skillId: 'PREA1-WRITTEN-THREE',
        level: 'Pre-A1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Escribe en inglés: "tres"',
        gradingRubric: 'El alumno debe escribir \'three\'. Se acepta la palabra \'three\' o el número \'3\'.',
        expectedKeywords: ['three', '3']
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
        text: 'Completa la oración: "I ___ mining in a cave."',
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
        text: 'Elige la opción correcta: "The creeper ___ next to the tree."',
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
        text: 'Completa: "There ___ three zombies near the village."',
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
        id: 'a1-pe-1',
        skillId: 'A1-WRITTEN-HELP-CAVE',
        level: 'A1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Estás en una cueva y no sabes dónde estás. Escribe un mensaje corto pidiendo ayuda.',
        gradingRubric: 'El mensaje debe ser corto (1 frase) y mostrar que el alumno pide ayuda. La IA debe verificar que la intención es clara aunque la gramática sea básica.',
        expectedKeywords: ['help', 'please', 'lost', 'me']
    },
    {
        id: 'a1-pe-2',
        skillId: 'A1-WRITTEN-GREET-CHAT',
        level: 'A1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Entras al servidor. Escribe un saludo corto en el chat.',
        gradingRubric: 'El mensaje debe ser un saludo simple y claro. La IA debe reconocer intención de saludar aunque la estructura sea básica.',
        expectedKeywords: ['hi', 'hello', 'hey']
    },
    {
        id: 'a1-pe-3',
        skillId: 'A1-WRITTEN-NEED-FOOD',
        level: 'A1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Tienes hambre. Escribe un mensaje corto pidiendo comida.',
        gradingRubric: 'El mensaje debe expresar necesidad de comida de forma simple. La IA debe validar intención y vocabulario básico relacionado con comida.',
        expectedKeywords: ['food', 'please', 'hungry', 'bread']
    },
    {
        id: 'a1-pe-4',
        skillId: 'A1-WRITTEN-WHERE-FRIENDS',
        level: 'A1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'No sabes dónde están tus amigos. Escribe un mensaje preguntando dónde están.',
        gradingRubric: 'El mensaje debe ser una pregunta simple sobre ubicación. La IA debe verificar intención de preguntar y uso básico de palabras clave.',
        expectedKeywords: ['where', 'you', 'are', 'friends']
    },
    {
        id: 'a1-pe-5',
        skillId: 'A1-WRITTEN-START-BUILD',
        level: 'A1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Escribe un mensaje corto para decir a tus amigos que hay que empezar a construir.',
        gradingRubric: 'El mensaje debe indicar inicio de una acción (construir). La IA debe verificar intención clara y vocabulario básico.',
        expectedKeywords: ['start', 'build', 'go', 'let\'s']
    },
    {
        id: 'a1-po-1',
        skillId: 'A1-ORAL-WOOD',
        level: 'A1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “tengo madera”.',
        gradingRubric: 'La IA debe evaluar que el alumno pronuncie “I have wood”. Se valora claridad básica.',
        expectedKeywords: ['I', 'have', 'wood']
    },
    {
        id: 'a1-po-2',
        skillId: 'A1-ORAL-LOOK',
        level: 'A1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “mira el creeper”.',
        gradingRubric: 'La IA debe evaluar que el alumno pronuncie “look at the creeper”.',
        expectedKeywords: ['look', 'at', 'the', 'creeper']
    },
    {
        id: 'a1-po-3',
        skillId: 'A1-ORAL-HELP',
        level: 'A1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “ayúdame por favor”.',
        gradingRubric: 'La IA debe evaluar que el alumno pronuncie “help me please”.',
        expectedKeywords: ['help', 'me', 'please']
    },
    {
        id: 'a1-po-4',
        skillId: 'A1-ORAL-SLEEP',
        level: 'A1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “vamos a dormir”.',
        gradingRubric: 'La IA debe evaluar que el alumno pronuncie “let\'s sleep” o “let\'s go to sleep”.',
        expectedKeywords: ['let\'s', 'sleep', 'go']
    },
    {
        id: 'a1-po-5',
        skillId: 'A1-ORAL-WHERE-SWORD',
        level: 'A1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “¿dónde está mi espada?”.',
        gradingRubric: 'La IA debe evaluar que el alumno pronuncie “where is my sword”.',
        expectedKeywords: ['where', 'is', 'my', 'sword']
    },

    // --- A1-alto ---
    {
        id: 'a1-alto-gv-1',
        skillId: 'A1ALTO-GRAMMAR-HAVE',
        level: 'A1-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "I ____ a wood house."',
        options: [
            { text: 'have', isCorrect: true },
            { text: 'has', isCorrect: false },
            { text: 'having', isCorrect: false },
            { text: 'haves', isCorrect: false }
        ],
        gradingRubric: 'El alumno usa correctamente \'have\' con \'I\'.',
        expectedKeywords: ['have', 'house']
    },
    {
        id: 'a1-alto-gv-2',
        skillId: 'A1ALTO-GRAMMAR-BE-HE',
        level: 'A1-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Elige la opción correcta: "He ____ mining diamonds."',
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
        text: 'Completa: "The apple is ___ the boat."',
        options: [
            { text: 'in', isCorrect: true },
            { text: 'on', isCorrect: false },
            { text: 'at', isCorrect: false },
            { text: 'to', isCorrect: false }
        ],
        gradingRubric: 'El alumno reconoce la preposición de lugar para estar dentro de algo.',
        expectedKeywords: ['in', 'boat']
    },
    {
        id: 'a1-alto-gv-4',
        skillId: 'A1ALTO-GRAMMAR-CAN',
        level: 'A1-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Elige la opción correcta: "We ___ build a farm."',
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
        text: 'Completa: "The zombie is ____ than the sheep."',
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
        id: 'a1-alto-pe-1',
        skillId: 'A1ALTO-WRITTEN-HELP',
        level: 'A1-alto',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Un zombie te ataca. Escribe un mensaje pidiendo ayuda.',
        gradingRubric: 'El mensaje debe indicar un ataque o peligro y pedir ayuda de forma sencilla.',
        expectedKeywords: ['help', 'zombie', 'me', 'please']
    },
    {
        id: 'a1-alto-pe-2',
        skillId: 'A1ALTO-WRITTEN-DIAMONDS',
        level: 'A1-alto',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Encontraste diamantes. Escribe un mensaje corto contándole a tu equipo.',
        gradingRubric: 'El mensaje debe comunicar un hallazgo (diamantes). La IA debe evaluar claridad del mensaje y uso de vocabulario básico del juego.',
        expectedKeywords: ['diamonds', 'found', 'I', 'we']
    },
    {
        id: 'a1-alto-pe-3',
        skillId: 'A1ALTO-WRITTEN-COME-HERE',
        level: 'A1-alto',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Tu amigo está lejos. Escribe un mensaje diciendo "ven aquí, tengo diamantes".',
        gradingRubric: 'El mensaje debe incluir la invitación a venir y el motivo (diamantes).',
        expectedKeywords: ['come', 'here', 'I', 'have', 'diamonds']
    },
    {
        id: 'a1-alto-pe-4',
        skillId: 'A1ALTO-WRITTEN-ASK-FOOD',
        level: 'A1-alto',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Quieres comida. Escribe un mensaje corto para pedir comida a otro jugador.',
        gradingRubric: 'El mensaje debe expresar una petición clara de comida. La IA debe evaluar intención y claridad, no perfección gramatical.',
        expectedKeywords: ['food', 'please', 'give', 'me', 'need']
    },
    {
        id: 'a1-alto-pe-5',
        skillId: 'A1ALTO-WRITTEN-BUILD-ACTION',
        level: 'A1-alto',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Van a construir una casa. Escribe un mensaje corto diciendo qué vas a hacer tú.',
        gradingRubric: 'El mensaje debe indicar una acción personal dentro de la construcción. La IA debe evaluar uso de \'I\' y una acción clara.',
        expectedKeywords: ['I', 'build', 'bring', 'make', 'house']
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
        id: 'a1-alto-po-1',
        skillId: 'A1ALTO-ORAL-HUNGRY',
        level: 'A1-alto',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “tengo hambre”.',
        gradingRubric: 'La IA evalúa si el alumno pronuncia “I am hungry”.',
        expectedKeywords: ['I', 'am', 'hungry']
    },
    {
        id: 'a1-alto-po-2',
        skillId: 'A1ALTO-ORAL-ZOMBIE-HERE',
        level: 'A1-alto',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “el zombie está aquí”.',
        gradingRubric: 'La IA evalúa si el alumno pronuncia “the zombie is here”.',
        expectedKeywords: ['the', 'zombie', 'is', 'here']
    },
    {
        id: 'a1-alto-po-3',
        skillId: 'A1ALTO-ORAL-GIVE-TORCH',
        level: 'A1-alto',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “dame una antorcha”.',
        gradingRubric: 'La IA evalúa si el alumno pronuncia “give me a torch”.',
        expectedKeywords: ['give', 'me', 'a', 'torch']
    },
    {
        id: 'a1-alto-po-4',
        skillId: 'A1ALTO-ORAL-NO-IRON',
        level: 'A1-alto',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “no tengo hierro”.',
        gradingRubric: 'La IA evalúa si el alumno pronuncia “I don\'t have iron” o “I have no iron”.',
        expectedKeywords: ['have', 'no', 'iron', 'don\'t']
    },
    {
        id: 'a1-alto-po-5',
        skillId: 'A1ALTO-ORAL-HOUSE-NEAR',
        level: 'A1-alto',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “mi casa está cerca”.',
        gradingRubric: 'La IA evalúa si el alumno pronuncia “my house is near”.',
        expectedKeywords: ['my', 'house', 'is', 'near']
    },

    // --- A2 ---
    {
        id: 'a2-gv-1',
        skillId: 'A2-GRAMMAR-PAST-FOUND',
        level: 'A2',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "Yesterday, I ____ diamonds in a cave."',
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
        text: 'Elige la opción correcta: "If it ____ dark, monsters spawn."',
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
        text: 'Completa: "I went to the village ___ buy food."',
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
        text: 'Elige la opción correcta: "This sword is ____ than the wooden one."',
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
        id: 'a2-pe-1',
        skillId: 'A2-WRITTEN-NIGHT-HOME',
        level: 'A2',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Es de noche. Dile a tus amigos que hay que ir a casa.',
        gradingRubric: 'El mensaje debe indicar que es de noche y sugerir ir a casa. La IA evalúa claridad en la instrucción.',
        expectedKeywords: ['night', 'go', 'home', 'house', 'run']
    },
    {
        id: 'a2-pe-2',
        skillId: 'A2-WRITTEN-LOST-SWORD',
        level: 'A2',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Perdiste tu espada en una cueva. Escribe un mensaje diciendo qué pasó.',
        gradingRubric: 'El mensaje debe describir la pérdida de la espada en pasado. La IA evalúa uso de pasado simple y vocabulario.',
        expectedKeywords: ['lost', 'sword', 'cave', 'in']
    },
    {
        id: 'a2-pe-3',
        skillId: 'A2-WRITTEN-TRADE-WOOD',
        level: 'A2',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Quieres madera. Escribe a tu amigo: "Tengo hierro, quiero madera".',
        gradingRubric: 'El mensaje debe expresar la oferta y el deseo de intercambio de forma clara.',
        expectedKeywords: ['have', 'iron', 'want', 'wood', 'trade']
    },
    {
        id: 'a2-pe-4',
        skillId: 'A2-WRITTEN-LOCATION-NEAR',
        level: 'A2',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Dile a tu amigo: "Estoy en la cueva cerca del río".',
        gradingRubric: 'El mensaje debe usar preposiciones de lugar y puntos de referencia básicos.',
        expectedKeywords: ['I am', 'in', 'cave', 'near', 'river']
    },
    {
        id: 'a2-pe-5',
        skillId: 'A2-WRITTEN-BUILD-ORDER',
        level: 'A2',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Dile a tu equipo: "Primero hacemos la casa, después buscamos comida".',
        gradingRubric: 'El mensaje debe usar conectores de secuencia (first, then/after).',
        expectedKeywords: ['first', 'house', 'then', 'after', 'food']
    },
    {
        id: 'a2-po-1',
        skillId: 'A2-ORAL-GO-HOME',
        level: 'A2',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “debemos ir a casa ahora”.',
        gradingRubric: 'La IA evalúa si el alumno pronuncia “we must go home now”.',
        expectedKeywords: ['we', 'must', 'go', 'home', 'now']
    },
    {
        id: 'a2-po-2',
        skillId: 'A2-ORAL-FOUND-VAL',
        level: 'A2',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “encontré hierro en la cueva”.',
        gradingRubric: 'La IA evalúa si el alumno pronuncia “I found iron in the cave”.',
        expectedKeywords: ['I', 'found', 'iron', 'in', 'the', 'cave']
    },
    {
        id: 'a2-po-3',
        skillId: 'A2-ORAL-DONT-DIG',
        level: 'A2',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “no caves hacia abajo”.',
        gradingRubric: 'La IA evalúa si el alumno pronuncia “don\'t dig down”.',
        expectedKeywords: ['don\'t', 'dig', 'down']
    },
    {
        id: 'a2-po-4',
        skillId: 'A2-ORAL-TRADE-WANT',
        level: 'A2',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “quiero esmeraldas por mi trigo”.',
        gradingRubric: 'La IA evalúa si el alumno pronuncia “I want emeralds for my wheat”.',
        expectedKeywords: ['I', 'want', 'emeralds', 'for', 'my', 'wheat']
    },
    {
        id: 'a2-po-5',
        skillId: 'A2-ORAL-BETTER-SWORD',
        level: 'A2',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “la espada es mejor que el pico”.',
        gradingRubric: 'La IA evalúa si el alumno pronuncia “the sword is better than the pickaxe”.',
        expectedKeywords: ['sword', 'is', 'better', 'than', 'pickaxe']
    },

    // --- A2-alto ---
    {
        id: 'a2-alto-gv-1',
        skillId: 'A2ALTO-GRAMMAR-PAST-CONT',
        level: 'A2-alto',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "While I ___ mining, I found diamonds."',
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
        text: 'Elige la opción correcta: "You ____ bring food before exploring the cave."',
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
        text: 'Completa: "A snowy mountain is ____ than the desert."',
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
        text: 'Completa: "If we ____ a village, we can trade."',
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
        text: 'Elige la opción correcta: "I prefer ____ with a bow."',
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
        id: 'a2-alto-pe-1',
        skillId: 'A2ALTO-WRITTEN-CREEPER-FIX',
        level: 'A2-alto',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Un creeper explotó. Dile a tu equipo que hay que reparar la base.',
        gradingRubric: 'El mensaje debe explicar el evento (explosión) y sugerir la reparación.',
        expectedKeywords: ['creeper', 'exploded', 'repair', 'fix', 'base']
    },
    {
        id: 'a2-alto-pe-2',
        skillId: 'A2ALTO-WRITTEN-RECS-EASY',
        level: 'A2-alto',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Mañana hay una pelea. Dile a tu equipo: "Traigan comida y armadura".',
        gradingRubric: 'El mensaje debe ser una instrucción clara para prepararse.',
        expectedKeywords: ['bring', 'food', 'armor', 'fight', 'tomorrow']
    },
    {
        id: 'a2-alto-pe-3',
        skillId: 'A2ALTO-WRITTEN-LOST-BACK',
        level: 'A2-alto',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Estamos perdidos. Dile a tu equipo: "Vamos a volver a la base".',
        gradingRubric: 'El mensaje debe expresar que están perdidos y proponer volver.',
        expectedKeywords: ['lost', 'we', 'go', 'back', 'base']
    },
    {
        id: 'a2-alto-pe-4',
        skillId: 'A2ALTO-WRITTEN-DESCRIBE-PLACE',
        level: 'A2-alto',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Encontraste un nuevo lugar. Escribe un mensaje describiéndolo y diciendo por qué es bueno.',
        gradingRubric: 'El mensaje debe incluir descripción simple y una razón (because/so). La IA debe evaluar si el alumno conecta ideas y describe el lugar.',
        expectedKeywords: ['place', 'is', 'good', 'because', 'there is', 'many']
    },
    {
        id: 'a2-alto-pe-5',
        skillId: 'A2ALTO-WRITTEN-ASSIGN-TASKS',
        level: 'A2-alto',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Van a dividir tareas. Escribe un mensaje asignando roles a tu equipo.',
        gradingRubric: 'El mensaje debe asignar al menos dos tareas a diferentes personas o roles. La IA debe evaluar claridad y organización.',
        expectedKeywords: ['you', 'I', 'we', 'build', 'get', 'bring', 'collect']
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
        id: 'a2-alto-po-1',
        skillId: 'A2ALTO-ORAL-MINING-SAW',
        level: 'A2-alto',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “estaba minando y vi un Enderman”.',
        gradingRubric: 'La IA evalúa si pronuncia “I was mining and I saw an Enderman”.',
        expectedKeywords: ['I', 'was', 'mining', 'and', 'saw', 'enderman']
    },
    {
        id: 'a2-alto-po-2',
        skillId: 'A2ALTO-ORAL-IF-TRADE',
        level: 'A2-alto',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “si encontramos una aldea, podemos intercambiar”.',
        gradingRubric: 'La IA evalúa si pronuncia “if we find a village, we can trade”.',
        expectedKeywords: ['if', 'we', 'find', 'village', 'can', 'trade']
    },
    {
        id: 'a2-alto-po-3',
        skillId: 'A2ALTO-ORAL-NETHER-TOMORROW',
        level: 'A2-alto',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “Nosotros vamos a explorar el Nether mañana”.',
        gradingRubric: 'La IA evalúa si pronuncia “we are going to explore the Nether tomorrow”.',
        expectedKeywords: ['we', 'are', 'going', 'to', 'explore', 'the', 'Nether', 'tomorrow']
    },
    {
        id: 'a2-alto-po-4',
        skillId: 'A2ALTO-ORAL-PREFER-BETTER',
        level: 'A2-alto',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “prefiero el arco porque es mejor que la espada”.',
        gradingRubric: 'La IA evalúa si pronuncia “I prefer the bow because it is better than the sword”.',
        expectedKeywords: ['I', 'prefer', 'the', 'bow', 'because', 'it', 'is', 'better', 'than', 'the', 'sword']
    },
    {
        id: 'a2-alto-po-5',
        skillId: 'A2ALTO-ORAL-APOLOGY',
        level: 'A2-alto',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “deberíamos ir al templo por los materiales”.',
        gradingRubric: 'La IA evalúa si pronuncia “we should go to the temple for the materials”.',
        expectedKeywords: ['we', 'should', 'go', 'to', 'the', 'temple', 'for', 'the', 'materials']
    },

    // --- B1 ---
    {
        id: 'b1-gv-1',
        skillId: 'B1-GRAMMAR-SECOND-COND',
        level: 'B1',
        category: 'Gramática y Vocabulario',
        type: 'multiple-choice',
        text: 'Completa: "If I ____ more diamonds, I would craft better armor."',
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
        text: 'Elige la opción correcta: "I have never ____ the Ender Dragon."',
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
        text: 'Completa: "The house _____ by the team yesterday."',
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
        text: 'Elige la opción correcta: "We stopped _____ because it was getting dark."',
        options: [
            { text: 'exploring', isCorrect: true },
            { text: 'explore', isCorrect: false },
            { text: 'explored', isCorrect: false },
            { text: 'to explored', isCorrect: false }
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
        text: 'Completa: "You got hurt. You ____ have used a shield to protect yourself."',
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
        id: 'b1-pe-1',
        skillId: 'B1-WRITTEN-MISSION-FAIL',
        level: 'B1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Perdieron recursos en la mina. Explica qué pasó y qué harán mejor la próxima vez.',
        gradingRubric: 'El alumno debe usar pasado para describir el evento y futuro/modales para la mejora.',
        expectedKeywords: ['lost', 'resources', 'mine', 'next', 'time', 'should', 'will']
    },
    {
        id: 'b1-pe-2',
        skillId: 'B1-WRITTEN-CAVE-STEPS',
        level: 'B1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Van a una cueva peligrosa. Escribe un plan de 3 pasos antes de entrar.',
        gradingRubric: 'El mensaje debe mostrar una secuencia organizada de acciones preparatorias.',
        expectedKeywords: ['plan', 'first', 'then', 'finally', 'bring', 'armor', 'food']
    },
    {
        id: 'b1-pe-3',
        skillId: 'B1-WRITTEN-BASE-ATTACK',
        level: 'B1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Atacaron la base. Explica el ataque y cómo mejorar la defensa.',
        gradingRubric: 'El mensaje debe conectar el problema (ataque) con una solución constructiva.',
        expectedKeywords: ['attacked', 'base', 'build', 'wall', 'protect', 'better']
    },
    {
        id: 'b1-pe-4',
        skillId: 'B1-WRITTEN-NEWBIE-TIPS',
        level: 'B1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Un jugador nuevo llegó. Escribe 3 consejos para sobrevivir su primera noche.',
        gradingRubric: 'El mensaje debe dar consejos claros usando imperativos o modales.',
        expectedKeywords: ['survive', 'build', 'house', 'food', 'night', 'zombies']
    },
    {
        id: 'b1-pe-5',
        skillId: 'B1-WRITTEN-OPINION-SIMPLE',
        level: 'B1',
        category: 'Producción Escrita',
        type: 'text-input',
        text: 'Tu equipo tiene una idea que no te gusta. Escribe tu opinión y el porqué.',
        gradingRubric: 'El alumno debe expresar desacuerdo y dar una razón clara.',
        expectedKeywords: ['I don\'t', 'agree', 'think', 'because', 'better']
    },
    {
        id: 'b1-po-1',
        skillId: 'B1-ORAL-SHIELD-ALIVE',
        level: 'B1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “si hubiese traído un escudo, estaría vivo”.',
        gradingRubric: 'La IA evalúa si pronuncia “if I had brought a shield, I would be alive”.',
        expectedKeywords: ['if', 'had', 'brought', 'shield', 'would', 'be', 'alive']
    },
    {
        id: 'b1-po-2',
        skillId: 'B1-ORAL-HADNT-FOUND',
        level: 'B1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “Llamaré a mi madre en cuanto llegue a casa”.',
        gradingRubric: 'La IA evalúa si pronuncia “I\'ll call my mother as soon as I get home”.',
        expectedKeywords: ['I', 'call', 'mother', 'as', 'soon', 'as', 'get', 'home']
    },
    {
        id: 'b1-po-3',
        skillId: 'B1-ORAL-FINISHED-ARRIVED',
        level: 'B1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “la casa ya estaba terminada cuando llegamos”.',
        gradingRubric: 'La IA evalúa si pronuncia “the house was already finished when we arrived”.',
        expectedKeywords: ['house', 'was', 'already', 'finished', 'when', 'we', 'arrived']
    },
    {
        id: 'b1-po-4',
        skillId: 'B1-ORAL-KILLED-DRAGON',
        level: 'B1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “nunca he matado al dragón, pero quiero intentarlo”.',
        gradingRubric: 'La IA evalúa si pronuncia “I have never killed the dragon, but I want to try it”.',
        expectedKeywords: ['I', 'have', 'never', 'killed', 'dragon', 'but', 'want', 'try']
    },
    {
        id: 'b1-po-5',
        skillId: 'B1-ORAL-NO-FOOD',
        level: 'B1',
        category: 'Producción Oral',
        type: 'audio-record',
        text: 'Di en inglés “cambiamos el plan porque no había comida”.',
        gradingRubric: 'La IA evalúa si pronuncia “we changed the plan because there was no food”.',
        expectedKeywords: ['we', 'changed', 'the', 'plan', 'because', 'there', 'was', 'no', 'food']
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
    // --- Pre-A1 Identificación Visual ---
    {
        id: 'pre-a1-vi-1',
        skillId: 'PREA1-VISUAL-COW',
        level: 'Pre-A1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Cow":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/cow.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/pig.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/sheep.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/chicken.png' }
        ]
    },
    {
        id: 'pre-a1-vi-2',
        skillId: 'PREA1-VISUAL-PIG',
        level: 'Pre-A1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Pig":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/pig.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/cow.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/chicken.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/flower.png' }
        ]
    },
    {
        id: 'pre-a1-vi-3',
        skillId: 'PREA1-VISUAL-DIRT',
        level: 'Pre-A1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Dirt":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/dirt.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/stone.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/wood.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/glass.png' }
        ]
    },
    {
        id: 'pre-a1-vi-4',
        skillId: 'PREA1-VISUAL-TREE',
        level: 'Pre-A1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Tree":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/tree.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/flower.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/grass.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/sun.png' }
        ]
    },
    {
        id: 'pre-a1-vi-5',
        skillId: 'PREA1-VISUAL-FLOWER',
        level: 'Pre-A1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Flower":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/flower.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/wood.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/pig.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/cow.png' }
        ]
    },    // A1 Nuevas

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

    // --- A1 Identificación Visual ---
    {
        id: 'a1-vi-1',
        skillId: 'A1-VISUAL-SWORD',
        level: 'A1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Sword":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/sword.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/stone.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/cloud.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/grass.png' }
        ]
    },
    {
        id: 'a1-vi-2',
        skillId: 'A1-VISUAL-GRASS',
        level: 'A1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Grass":',
        options: [
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/axe.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/stone.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/cloud.png' },
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/grass.png' }
        ]
    },
    {
        id: 'a1-vi-3',
        skillId: 'A1-VISUAL-AXE',
        level: 'A1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Bed":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/bed.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/furnace.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/book.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/log.png' }
        ]
    },
    {
        id: 'a1-vi-4',
        skillId: 'A1-VISUAL-CHEST',
        level: 'A1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Book":',
        options: [
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/chest.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/flower.png' },
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/book.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/sand.png' }
        ]
    },
    {
        id: 'a1-vi-5',
        skillId: 'A1-VISUAL-BREAD',
        level: 'A1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Bread":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/bread.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/apple.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/carrot.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/Cookie_JE2_BE2.png' }
        ]
    },

    // --- A1-alto Identificación Visual ---
    {
        id: 'a1-alto-vi-1',
        skillId: 'A1ALTO-VISUAL-CLOCK',
        level: 'A1-alto',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Clock":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/clock.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/bucket.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/compass.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/map.png' }
        ]
    },
    {
        id: 'a1-alto-vi-2',
        skillId: 'A1ALTO-VISUAL-COMPASS',
        level: 'A1-alto',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Compass":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/compass.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/clock.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/map.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/glass.png' }
        ]
    },
    {
        id: 'a1-alto-vi-3',
        skillId: 'A1ALTO-VISUAL-MAP',
        level: 'A1-alto',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Map":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/map.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/paper.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/book.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/glass.png' }
        ]
    },
    {
        id: 'a1-alto-vi-4',
        skillId: 'A1ALTO-VISUAL-BUCKET',
        level: 'A1-alto',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Bucket":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/bucket.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/bowl.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/glass.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/book.png' }
        ]
    },
    {
        id: 'a1-alto-vi-5',
        skillId: 'A1ALTO-VISUAL-FISHING-ROD',
        level: 'A1-alto',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Fishing Rod":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/fishing_rod.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/stick.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/sword.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/bow.png' }
        ]
    },



    // --- A2 Identificación Visual ---
    {
        id: 'a2-vi-1',
        skillId: 'A2-VISUAL-CAMPFIRE',
        level: 'A2',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Campfire":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/campfire.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/torch.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/lantern.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/chest.gif' }
        ]
    },
    {
        id: 'a2-vi-2',
        skillId: 'A2-VISUAL-BOAT',
        level: 'A2',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Boat":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/boat.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/minecart.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/horse.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/saddle.png' }
        ]
    },
    {
        id: 'a2-vi-3',
        skillId: 'A2-VISUAL-LANTERN',
        level: 'A2',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Lantern":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/lantern.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/torch.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/glowstone.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/sun.png' }
        ]
    },
    {
        id: 'a2-vi-4',
        skillId: 'A2-VISUAL-SCISSORS',
        level: 'A2',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Scissors":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/shears.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/cake.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/axe.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/paper.png' }
        ]
    },
    {
        id: 'a2-vi-5',
        skillId: 'A2-VISUAL-SPYGLASS',
        level: 'A2',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Spyglass":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/spyglass.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/glass.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/compass.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/bottle.png' }
        ]
    },

    // --- A2-alto Identificación Visual ---
    {
        id: 'a2-alto-vi-1',
        skillId: 'A2ALTO-VISUAL-FLOWER-POT',
        level: 'A2-alto',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Flower Pot":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/flower_pot.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/glass.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/bucket.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/bowl.png' }
        ]
    },
    {
        id: 'a2-alto-vi-2',
        skillId: 'A2ALTO-VISUAL-BELL',
        level: 'A2-alto',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Bell":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/bell.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/candle.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/lantern.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/compass.gif' }
        ]
    },
    {
        id: 'a2-alto-vi-3',
        skillId: 'A2ALTO-VISUAL-CANDLE',
        level: 'A2-alto',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Candle":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/candle.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/lantern.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/torch.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/cake.png' }
        ]
    },
    {
        id: 'a2-alto-vi-4',
        skillId: 'A2ALTO-VISUAL-BRUSH',
        level: 'A2-alto',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Brush":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/brush.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/pickaxe.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/stick.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/shovel.png' }
        ]
    },
    {
        id: 'a2-alto-vi-5',
        skillId: 'A2ALTO-VISUAL-LIGHTNING-ROD',
        level: 'A2-alto',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Ladder":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/ladder.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/iron_bars.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/Fence.webp' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/chain.png' }
        ]
    },


    // --- B1 Identificación Visual ---
    {
        id: 'b1-vi-1',
        skillId: 'B1-VISUAL-ANVIL',
        level: 'B1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Anvil":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/anvil.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/bucket.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/stone.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/barrel.png' }
        ]
    },
    {
        id: 'b1-vi-2',
        skillId: 'B1-VISUAL-CAULDRON',
        level: 'B1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Cauldron":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/cauldron.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/flower_pot.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/bucket.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/bowl.png' }
        ]
    },
    {
        id: 'b1-vi-3',
        skillId: 'B1-VISUAL-BOOKSHELF',
        level: 'B1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Bookshelf":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/bookshelf.webp' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/chest.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/barrel.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/log.png' }
        ]
    },
    {
        id: 'b1-vi-4',
        skillId: 'B1-VISUAL-LECTERN',
        level: 'B1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Lectern":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/lectern.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/chest.gif' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/barrel.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/bookshelf.webp' }
        ]
    },
    {
        id: 'b1-vi-5',
        skillId: 'B1-VISUAL-CROSSBOW',
        level: 'B1',
        category: 'Identificación Visual',
        type: 'image-choice',
        text: 'Cual de estas imagenes corresponde a "Crossbow":',
        options: [
            { text: '', isCorrect: true, imageUrl: '/images/evaluacion/crossbow.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/bow.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/arrow.png' },
            { text: '', isCorrect: false, imageUrl: '/images/evaluacion/sword.png' }
        ]
    },


];
