// Esquema de la lección estilo Duolingo (activities.content).
// Una lección = una secuencia de ejercicios tipados. El player itera sobre ellos.

export type Skill = 'listening' | 'reading' | 'writing' | 'speaking' | 'pronunciation';

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
export interface ExMatchPairs {        // Match the Meaning
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
export interface ExListenBuild {       // Escucha y arma la frase con fichas (sin teclado)
    type: 'listen_build';
    instruction?: string;
    audio: string;                     // frase en inglés que se escucha (audio/TTS)
    answer: string[];                  // orden correcto de las palabras (fichas)
    prompt?: string;                   // ayuda/traducción en español, opcional
}
export interface ExConversation {      // Small Conversation (con IA + voz)
    type: 'conversation';
    instruction?: string;
    scenario: string;
    objective: string;
    starter: string;
    minTurns?: number;
}

export type Exercise =
    | ExTextMC | ExAudioMC | ExWhoSaidIt | ExMatchPairs | ExMultiSelect
    | ExWordBank | ExFillBlank | ExFreeText | ExSpeak | ExConversation | ExListenBuild;

export interface LessonContent {
    kind: 'lesson';
    skill: Skill;
    exercises: Exercise[];
}

export const SKILL_META: Record<Skill, { label: string; icon: string; color: string }> = {
    listening:     { label: 'Listening',     icon: 'Headphones',  color: '#3b82f6' },
    reading:       { label: 'Reading',       icon: 'BookOpen',    color: '#632EB0' },
    writing:       { label: 'Writing',       icon: 'PenTool',     color: '#f59e0b' },
    speaking:      { label: 'Speaking',      icon: 'Mic',         color: '#ec4899' },
    pronunciation: { label: 'Pronunciation', icon: 'Volume2',     color: '#10b981' },
};
