// Esquema de la lección estilo Duolingo (activities.content).
// Una lección = una secuencia de ejercicios tipados. El player itera sobre ellos.
// Cada destreza es PURA: solo lleva tipos de su canal (ver SKILL_EXERCISE_WHITELIST).
// La única que mezcla es la "actividad simple" (LessonContent.mixed = true).

export type Skill = 'listening' | 'reading' | 'writing' | 'speaking' | 'pronunciation' | 'conversation';

// --- Contenido v2 (adiciones, TODO opcional => retrocompatible) ---
// `contentVersion` ausente = v1 = comportamiento de hoy. Estos tipos solo se usan
// cuando una lección los autora; nada de esto cambia la calificación ni el flujo v1.

// Fase de liberación gradual de la lección (TE MUESTRO -> PRACTICAMOS -> LO APLICAS).
// 'recognize' = receptivos fáciles; 'produce' = productivos; 'apply' = aplicación en contexto nuevo.
export type LessonSection = 'recognize' | 'produce' | 'apply';

// Envoltura de metadata por ejercicio. Todo opcional: un ejercicio sin `meta` se
// comporta exactamente como en v1. La usan el motor adaptativo y la telemetría.
export interface ExMeta {
    conceptId?: string;          // slug primario del concepto (átomo/"mena") que entrena
    conceptIds?: string[];       // si entrena varios (p. ej. reading_passage)
    section?: LessonSection;     // fase de liberación gradual
    difficulty?: number;         // 1.0–6.0 (CEFR, misma escala que diagnostic_items.difficulty)
    isReview?: boolean;          // lo marca el motor en runtime (repaso espaciado)
    hint?: string;               // andamiaje pre-respuesta (la "Antorcha")
    tip?: string;                // micro-regla
}

// Paso "TE MUESTRO" (Libro de Recetas): exposición pura, sin calificar ni pagar XP.
export interface PresentItem {
    conceptId: string;           // slug del concepto que se presenta
    headline: string;            // texto principal de la tarjeta
    en?: string;                 // forma en inglés (se puede escuchar)
    es?: string;                 // traducción/ayuda en español
    note?: string;               // nota/explicación breve
    ipa?: string;                // transcripción fonética opcional
    imageUrl?: string;           // ilustración opcional
    icon?: string;               // icono/textura del bloque-ingrediente
    audioRole?: string;          // voz ElevenLabs a usar (VOICE_ROLES); TTS solo fallback
}
export type PresentTheme = 'recipe_book' | 'crafting_table' | 'enchanting_table' | 'map';
export interface PresentStep {
    title?: string;
    intro?: string;
    items: PresentItem[];        // 3–5 ingredientes/bloques a mostrar
    theme?: PresentTheme;
}

// --- Ejercicios (unión discriminada por `type`) ---
export interface ExTextMC {            // Read & Choose / Complete the Conversation (texto)
    type: 'text_mc';
    meta?: ExMeta;
    instruction?: string;              // título del ejercicio
    prompt: string;                    // texto/pregunta (puede ir en inglés)
    promptAudio?: string;              // si existe, se puede escuchar (TTS)
    options: string[];
    correct: number;
}
export interface ExAudioMC {           // Listen & Choose
    type: 'audio_mc';
    meta?: ExMeta;
    instruction?: string;
    audio: string;                     // texto en inglés que se escucha (TTS)
    prompt?: string;
    options: string[];
    correct: number;
}
export interface ExWhoSaidIt {         // Who said it? (cada opción "habla")
    type: 'who_said_it';
    meta?: ExMeta;
    instruction?: string;
    target: string;                    // palabra correcta a identificar
    options: string[];                 // cada opción es lo que "dice" un NPC (TTS)
    correct: number;
}
export interface ExListenMissingWord { // Listen for the missing word (listening)
    type: 'listen_missing_word';
    meta?: ExMeta;
    instruction?: string;
    audio: string;                     // frase completa que se escucha (TTS)
    options: string[];                 // palabra que falta (cada opción suena al tocar)
    correct: number;
}
export interface ExTapPairsAudio {     // Emparejar sonido -> palabra escrita (listening)
    type: 'tap_pairs_audio';
    meta?: ExMeta;
    instruction?: string;
    pairs: { audio: string; word: string }[]; // izquierda suena (audio), derecha es la palabra
}
export interface ExMatchPairs {        // Match the Meaning (reading, texto<->texto)
    type: 'match_pairs';
    meta?: ExMeta;
    instruction?: string;
    pairs: { en: string; es: string }[];
}
export interface ExMultiSelect {       // Find the X / Secret Sound Discovery
    type: 'multi_select';
    meta?: ExMeta;
    instruction?: string;
    prompt?: string;
    sound?: string;                    // "Sound of the Day" (TTS), opcional
    options: { text: string; correct: boolean }[];
}
export interface ExWordBank {          // Unscramble the Sentence
    type: 'word_bank';
    meta?: ExMeta;
    instruction?: string;
    prompt?: string;                   // traducción/ayuda en español
    answer: string[];                  // orden correcto de las palabras
}
export interface ExFillBlank {         // Fill the Missing Word
    type: 'fill_blank';
    meta?: ExMeta;
    instruction?: string;
    before: string;                    // texto antes del hueco
    after: string;                     // texto después del hueco
    options: string[];
    correct: number;
}
export interface ExFreeText {          // Introduce Yourself / Describe (respuesta libre)
    type: 'free_text';
    meta?: ExMeta;
    instruction?: string;
    prompt: string;
    promptAudio?: string;
    imageUrl?: string;
    accept: string[];                  // respuestas aceptadas (substring, case-insensitive)
}
export interface ExSpeak {             // Repeat After Me / Say X / Secret Sound Challenge
    type: 'speak';
    meta?: ExMeta;
    instruction?: string;
    say: string;                       // frase a decir/repetir (inglés)
    prompt?: string;                   // instrucción en español
}
export interface ExSpeakRepeat {       // Listen-then-repeat (speaking andamiado)
    type: 'speak_repeat';
    meta?: ExMeta;
    instruction?: string;
    say: string;                       // modelo del nativo que se escucha y luego se repite
    prompt?: string;
}
export interface ExSpeakAnswer {       // Responde HABLANDO una pregunta (producción)
    type: 'speak_answer';
    meta?: ExMeta;
    instruction?: string;
    question: string;                  // pregunta (se muestra y se escucha)
    accept: string[];                  // palabras/respuestas clave aceptadas
    prompt?: string;
}
export interface ExMinimalPairs {      // Discriminación fina ship/sheep (pronunciation)
    type: 'minimal_pairs';
    meta?: ExMeta;
    instruction?: string;
    audio: string;                     // la palabra que de verdad suena
    options: string[];                 // par mínimo (incluye la correcta)
    correct: number;
    ipa?: string[];                    // IPA opcional por opción (hint)
}
export interface ExListenBuild {       // Escucha y arma la frase con fichas (sin teclado)
    type: 'listen_build';
    meta?: ExMeta;
    instruction?: string;
    audio: string;                     // frase en inglés que se escucha (audio/TTS)
    answer: string[];                  // orden correcto de las palabras (fichas)
    prompt?: string;                   // ayuda/traducción en español, opcional
}
export interface ExConversation {      // Conversación con NPC IA (chat de texto; o voz si mode='voice')
    type: 'conversation';
    meta?: ExMeta;
    instruction?: string;
    scenario: string;
    objective: string;
    starter: string;
    minTurns?: number;
    mode?: 'text' | 'voice';           // 'voice' = tiempo real (ElevenLabs), Fase 4
    persona?: string;                  // descripción del personaje, para voz
    maxTurns?: number;
}

export interface ExDialogue {          // Chat guiado estilo Instagram: cada turno del NPC con 3 respuestas (1 correcta)
    type: 'dialogue';
    meta?: ExMeta;
    instruction?: string;
    persona?: string;                  // nombre del personaje (ej. "Aldeano Alex")
    turns: { npc: string; options: { text: string; correct: boolean }[] }[];
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
    meta?: ExMeta;
    instruction?: string;
    pool: { en: string; es: string }[];
    seconds?: number;
}

export interface ExReadingPassage {
    type: 'reading_passage';
    meta?: ExMeta;
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
    | ExConversation | ExReadingPassage | ExMatchMadness | ExDialogue;

export interface LessonContent {
    kind: 'lesson';
    skill: Skill;
    exercises: Exercise[];
    mixed?: boolean;                   // true = "actividad simple": puede combinar tipos de cualquier destreza
    // --- v2 (adiciones opcionales => retrocompatible; ausencia = v1 = comportamiento de hoy) ---
    contentVersion?: 1 | 2;            // ausente o 1 = v1; 2 = lección con present/secciones/meta
    present?: PresentStep;             // paso "TE MUESTRO" (Libro de Recetas), no califica ni paga XP
    lives?: boolean;                   // activa "corazones" (off en bandas bajas para no estresar)
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
    conversation:  ['conversation', 'dialogue'],
};

// =============================================================================
// Helpers v2 (todo retrocompatible). `normalizeLesson` vive de forma canónica en
// `src/lib/contentVersion.ts` (doble-lectura v1/v2) y se re-exporta aquí por
// conveniencia; la importación de tipos allí es type-only, así que NO hay ciclo
// en tiempo de ejecución.
// =============================================================================
export { normalizeLesson } from './contentVersion';
export type { NormalizedLesson } from './contentVersion';

// ¿Es una lección v2? (present/secciones/meta). Ausencia o contentVersion!=2 => v1.
export function isLessonV2(content: unknown): boolean {
    return !!content && typeof content === 'object'
        && (content as Partial<LessonContent>).contentVersion === 2;
}

// Validación ligera de forma (no lanza, devuelve boolean). Para v1 solo exige la
// forma mínima de hoy; para v2 además exige present (3–5 items) y que cada
// `conceptId` del present aparezca en algún ejercicio (cobertura de §3.3 del plan).
export function lessonShapeOk(content: unknown): content is LessonContent {
    if (!content || typeof content !== 'object') return false;
    const c = content as Partial<LessonContent>;
    if (c.kind !== 'lesson') return false;
    if (typeof c.skill !== 'string') return false;
    if (!Array.isArray(c.exercises) || c.exercises.length === 0) return false;
    if (c.contentVersion === 2) {
        const present = c.present;
        if (!present || !Array.isArray(present.items)) return false;
        if (present.items.length < 3 || present.items.length > 5) return false;
        // Conceptos cubiertos por los ejercicios (meta.conceptId / meta.conceptIds).
        const covered = new Set<string>();
        for (const ex of c.exercises) {
            const m = (ex as { meta?: ExMeta }).meta;
            if (!m) continue;
            if (m.conceptId) covered.add(m.conceptId);
            if (Array.isArray(m.conceptIds)) for (const id of m.conceptIds) covered.add(id);
        }
        for (const it of present.items) {
            if (it.conceptId && !covered.has(it.conceptId)) return false;
        }
    }
    return true;
}
