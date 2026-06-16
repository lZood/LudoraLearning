// Esquema del contenido de cada actividad (columna activities.content jsonb).
// Un mismo "shape" por tipo de actividad; el player renderiza según el tipo.

export interface TheorySlide {
    title: string;
    body: string;
    imageUrl?: string;
    phrases?: string[]; // "English — Español"
}

export interface QuizQuestion {
    prompt: string;        // enunciado (puede estar en español)
    options: string[];     // opciones (en inglés normalmente)
    correct: number;       // índice de la opción correcta (grading client-side; práctica formativa)
    explanation?: string;  // breve explicación tras responder
}

export interface TheoryContent {
    kind: 'theory';
    slides: TheorySlide[];
}
export interface QuizContent {
    kind: 'quiz';          // exercise / midterm / final
    intro?: string;
    questions: QuizQuestion[];
}
export interface AudioContent {
    kind: 'audio';         // listening con SpeechSynthesis (voz del navegador, en-US)
    tts: string;           // texto en inglés que se "escucha"
    questions: QuizQuestion[];
}
export interface ChatContent {
    kind: 'chat';          // práctica conversacional con IA (Gemini)
    scenario: string;      // contexto (español)
    objective: string;     // meta del alumno (español)
    starter: string;       // primer mensaje del NPC (inglés)
    minTurns?: number;     // turnos mínimos del alumno para completar (default 3)
}

export type ActivityContent = TheoryContent | QuizContent | AudioContent | ChatContent;

// Mapea el `type` de la actividad (BD) al "kind" de contenido que espera el player.
export function kindForType(type: string): ActivityContent['kind'] {
    switch (type) {
        case 'theory': return 'theory';
        case 'audio': return 'audio';
        case 'chat': return 'chat';
        case 'exercise':
        case 'midterm':
        case 'final':
        default: return 'quiz';
    }
}
