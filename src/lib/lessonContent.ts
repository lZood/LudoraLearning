// Esquema de la lección estilo Duolingo (activities.content).
// Una lección = una secuencia de ejercicios tipados. El player itera sobre ellos.
// Cada destreza es PURA: solo lleva tipos de su canal (ver SKILL_EXERCISE_WHITELIST).
// La única que mezcla es la "actividad simple" (LessonContent.mixed = true).

export type Skill = 'listening' | 'reading' | 'writing' | 'speaking' | 'pronunciation' | 'conversation';

// --- Ejercicios (unión discriminada por `type`) ---
export interface ExTextMC {            // Read & Choose / Complete the Conversation (texto)
    type: 'text_mc';
    instruction?: string;              // título del ejercicio
    prompt: string;                    // texto/pregunta (puede ir en inglés)
    promptAudio?: string;              // si existe, se puede escuchar (TTS)
    options: string[];
    correct: number;
}
export interface ExAudioMC {           // Listen & Choose
    type: 'audio_mc';
    instruction?: string;
    audio: string;                     // texto en inglés que se escucha (TTS)
    prompt?: string;
    options: string[];
    correct: number;
}
export interface ExWhoSaidIt {         // Who said it? (cada opción "habla")
    type: 'who_said_it';
    instruction?: string;
    target: string;                    // palabra correcta a identificar
    options: string[];                 // cada opción es lo que "dice" un NPC (TTS)
    correct: number;
}
export interface ExListenMissingWord { // Listen for the missing word (listening)
    type: 'listen_missing_word';
    instruction?: string;
    audio: string;                     // frase completa que se escucha (TTS)
    options: string[];                 // palabra que falta (cada opción suena al tocar)
    correct: number;
}
export interface ExTapPairsAudio {     // Emparejar sonido -> palabra escrita (listening)
    type: 'tap_pairs_audio';
    instruction?: string;
    pairs: { audio: string; word: string }[]; // izquierda suena (audio), derecha es la palabra
}
export interface ExMatchPairs {        // Match the Meaning (reading, texto<->texto)
    type: 'match_pairs';
    instruction?: string;
    pairs: { en: string; es: string }[];
}
export interface ExMultiSelect {       // Find the X / Secret Sound Discovery
    type: 'multi_select';
    instruction?: string;
    prompt?: string;
    sound?: string;                    // "Sound of the Day" (TTS), opcional
    options: { text: string; correct: boolean }[];
}
export interface ExWordBank {          // Unscramble the Sentence
    type: 'word_bank';
    instruction?: string;
    prompt?: string;                   // traducción/ayuda en español
    answer: string[];                  // orden correcto de las palabras
}
export interface ExFillBlank {         // Fill the Missing Word
    type: 'fill_blank';
    instruction?: string;
    before: string;                    // texto antes del hueco
    after: string;                     // texto después del hueco
    options: string[];
    correct: number;
}
export interface ExFreeText {          // Introduce Yourself / Describe (respuesta libre)
    type: 'free_text';
    instruction?: string;
    prompt: string;
    promptAudio?: string;
    imageUrl?: string;
    accept: string[];                  // respuestas aceptadas (substring, case-insensitive)
}
export interface ExSpeak {             // Repeat After Me / Say X / Secret Sound Challenge
    type: 'speak';
    instruction?: string;
    say: string;                       // frase a decir/repetir (inglés)
    prompt?: string;                   // instrucción en español
}
export interface ExSpeakRepeat {       // Listen-then-repeat (speaking andamiado)
    type: 'speak_repeat';
    instruction?: string;
    say: string;                       // modelo del nativo que se escucha y luego se repite
    prompt?: string;
}
export interface ExSpeakAnswer {       // Responde HABLANDO una pregunta (producción)
    type: 'speak_answer';
    instruction?: string;
    question: string;                  // pregunta (se muestra y se escucha)
    accept: string[];                  // palabras/respuestas clave aceptadas
    prompt?: string;
}
export interface ExMinimalPairs {      // Discriminación fina ship/sheep (pronunciation)
    type: 'minimal_pairs';
    instruction?: string;
    audio: string;                     // la palabra que de verdad suena
    options: string[];                 // par mínimo (incluye la correcta)
    correct: number;
    ipa?: string[];                    // IPA opcional por opción (hint)
}
export interface ExListenBuild {       // Escucha y arma la frase con fichas (sin teclado)
    type: 'listen_build';
    instruction?: string;
    audio: string;                     // frase en inglés que se escucha (audio/TTS)
    answer: string[];                  // orden correcto de las palabras (fichas)
    prompt?: string;                   // ayuda/traducción en español, opcional
}
export interface ExConversation {      // Conversación con NPC IA (chat de texto; o voz si mode='voice')
    type: 'conversation';
    instruction?: string;
    scenario: string;
    objective: string;
    starter: string;
    minTurns?: number;
    mode?: 'text' | 'voice';           // 'voice' = tiempo real (ElevenLabs), Fase 4
    persona?: string;                  // descripción del personaje, para voz
    maxTurns?: number;
}

// --- Lectura interactiva (reading_passage) ---
export type ReadingQuestion =
    | { kind: 'cloze'; gapId: number; prompt?: string; options: string[]; correct: number }
    | { kind: 'insert_sentence'; afterSentenceId: number; prompt?: string; options: string[]; correct: number }
    | { kind: 'highlight'; prompt: string; correctSentenceId: number }
    | { kind: 'main_idea'; prompt?: string; options: string[]; correct: number }
    | { kind: 'title'; prompt?: string; options: string[]; correct: number };

export interface ExMatchMadness {      // Juego: emparejar contra reloj (solo en actividad simple)
    type: 'match_madness';
    instruction?: string;
    pool: { en: string; es: string }[];
    seconds?: number;
}

export interface ExReadingPassage {
    type: 'reading_passage';
    instruction?: string;
    title?: string | null;             // título mostrado (o null si hay pregunta 'title')
    sentences: { id: number; text: string; gapId?: number }[]; // pasaje partido en oraciones
    glossary?: { word: string; es: string }[];                 // tap-to-reveal (scaffolding)
    questions: ReadingQuestion[];
}

export type Exercise =
    | ExTextMC | ExAudioMC | ExWhoSaidIt | ExListenMissingWord | ExTapPairsAudio
    | ExMatchPairs | ExMultiSelect | ExWordBank | ExFillBlank | ExFreeText
    | ExSpeak | ExSpeakRepeat | ExSpeakAnswer | ExMinimalPairs | ExListenBuild
    | ExConversation | ExReadingPassage | ExMatchMadness;

export interface LessonContent {
    kind: 'lesson';
    skill: Skill;
    exercises: Exercise[];
    mixed?: boolean;                   // true = "actividad simple": puede combinar tipos de cualquier destreza
}

export const SKILL_META: Record<Skill, { label: string; icon: string; color: string }> = {
    listening:     { label: 'Listening',     icon: 'Headphones',     color: '#3b82f6' },
    reading:       { label: 'Reading',       icon: 'BookOpen',       color: '#632EB0' },
    writing:       { label: 'Writing',       icon: 'PenTool',        color: '#f59e0b' },
    speaking:      { label: 'Speaking',      icon: 'Mic',            color: '#ec4899' },
    pronunciation: { label: 'Pronunciation', icon: 'Volume2',        color: '#10b981' },
    conversation:  { label: 'Conversación',  icon: 'MessagesSquare', color: '#06b6d4' },
};

// Pureza por destreza: qué tipos puede contener la lección de cada destreza.
// La "actividad simple" (mixed:true) está exenta de esta whitelist.
export const SKILL_EXERCISE_WHITELIST: Record<Skill, Exercise['type'][]> = {
    listening:     ['audio_mc', 'who_said_it', 'listen_build', 'listen_missing_word', 'tap_pairs_audio'],
    reading:       ['text_mc', 'match_pairs', 'multi_select', 'reading_passage'],
    writing:       ['word_bank', 'fill_blank', 'free_text'],
    speaking:      ['speak', 'speak_repeat', 'speak_answer'],
    pronunciation: ['multi_select', 'speak', 'minimal_pairs'],
    conversation:  ['conversation'],
};
