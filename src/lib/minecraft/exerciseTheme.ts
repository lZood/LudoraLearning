// Biblia de tematización Minecraft — EJERCICIO → ACCIÓN DE BLOQUE (capa de datos pura).
// Da copy/icono/sfx a cada uno de los 19 tipos REALES de ejercicio. El Renderer sólo
// inyecta esto (verbo/instrucción/icono/sonido); NUNCA toca la calificación. Ver §2.2.
//
// IMPORTANTE: los tipos se manejan como string literals a propósito (NO se importa el
// tipo `Exercise`) para no acoplar este módulo a otro track.

import type { SfxKey } from '@/lib/minecraft/sfx';

// Los 19 tipos reales soportados por el renderer.
export type ExerciseType =
    | 'text_mc'
    | 'audio_mc'
    | 'who_said_it'
    | 'multi_select'
    | 'match_pairs'
    | 'word_bank'
    | 'fill_blank'
    | 'free_text'
    | 'speak'
    | 'speak_repeat'
    | 'speak_answer'
    | 'listen_build'
    | 'listen_missing_word'
    | 'tap_pairs_audio'
    | 'minimal_pairs'
    | 'reading_passage'
    | 'match_madness'
    | 'dialogue'
    | 'conversation';

export interface ExerciseThemeInfo {
    verb: string;                // verbo del mundo (picar/colocar/craftear…)
    instructionFallback: string; // instrucción si el ejercicio no trae una propia
    icon: string;                // emoji decorativo (skin, no instrucción)
    blockTexture?: string;       // textura de bloque sugerida (clave propia)
    sfxKey: SfxKey;              // sonido al interactuar con el bloque
}

const THEMES: Record<ExerciseType, ExerciseThemeInfo> = {
    // Receptivos: elegir el bloque correcto.
    text_mc: { verb: 'Elige el bloque', instructionFallback: 'Elige el bloque correcto', icon: '🟩', blockTexture: 'grass', sfxKey: 'block_break' },
    audio_mc: { verb: 'Escucha y pica', instructionFallback: 'Escucha y pica el bloque correcto', icon: '🔊', blockTexture: 'note', sfxKey: 'block_break' },
    who_said_it: { verb: 'Adivina quién habló', instructionFallback: '¿Quién colocó este bloque?', icon: '🗣️', blockTexture: 'head', sfxKey: 'block_break' },
    // Cueva: minar todos los correctos.
    multi_select: { verb: 'Mina todos los correctos', instructionFallback: 'Mina todos los bloques correctos', icon: '⛏️', blockTexture: 'ore', sfxKey: 'block_break' },
    // Emparejar con cuerda.
    match_pairs: { verb: 'Empareja con cuerda', instructionFallback: 'Empareja cada bloque con su par', icon: '🪢', blockTexture: 'string', sfxKey: 'block_place' },
    tap_pairs_audio: { verb: 'Empareja por sonido', instructionFallback: 'Empareja cada sonido con su bloque', icon: '🔔', blockTexture: 'string', sfxKey: 'block_place' },
    // Crafteo: construir la frase.
    word_bank: { verb: 'Craftea la frase', instructionFallback: 'Craftea la frase con los bloques', icon: '🧰', blockTexture: 'plank', sfxKey: 'block_place' },
    listen_build: { verb: 'Escucha y craftea', instructionFallback: 'Escucha y craftea la frase', icon: '🎧', blockTexture: 'plank', sfxKey: 'block_place' },
    // Colocar el bloque en el hueco.
    fill_blank: { verb: 'Coloca el bloque', instructionFallback: 'Coloca el bloque en el hueco', icon: '🧱', blockTexture: 'brick', sfxKey: 'block_place' },
    listen_missing_word: { verb: 'Coloca el bloque que falta', instructionFallback: 'Escucha y coloca el bloque que falta', icon: '🧩', blockTexture: 'brick', sfxKey: 'block_place' },
    // Forjar/escribir en el Yunque.
    free_text: { verb: 'Forja tu respuesta', instructionFallback: 'Forja tu respuesta en el yunque', icon: '⚒️', blockTexture: 'anvil', sfxKey: 'block_place' },
    // Hablar al Yunque/Campana.
    speak: { verb: 'Habla al yunque', instructionFallback: 'Habla para forjar la frase', icon: '🎙️', blockTexture: 'anvil', sfxKey: 'block_place' },
    speak_repeat: { verb: 'Repite en voz alta', instructionFallback: 'Repite la frase en voz alta', icon: '🎙️', blockTexture: 'anvil', sfxKey: 'block_place' },
    speak_answer: { verb: 'Responde hablando', instructionFallback: 'Responde a la campana hablando', icon: '🔔', blockTexture: 'bell', sfxKey: 'block_place' },
    // Afinar la campana (pronunciación).
    minimal_pairs: { verb: 'Afina la campana', instructionFallback: 'Afina la campana: distingue el sonido', icon: '🎵', blockTexture: 'bell', sfxKey: 'block_break' },
    // Pergamino / lectura.
    reading_passage: { verb: 'Lee el pergamino', instructionFallback: 'Lee el pergamino y responde', icon: '📜', blockTexture: 'paper', sfxKey: 'block_break' },
    // Mina Relámpago.
    match_madness: { verb: 'Mina relámpago', instructionFallback: 'Empareja a contrarreloj antes de que se agote', icon: '⚡', blockTexture: 'ore', sfxKey: 'block_break' },
    // Charla con el Aldeano.
    dialogue: { verb: 'Charla con el aldeano', instructionFallback: 'Charla con el aldeano', icon: '💬', blockTexture: 'emerald', sfxKey: 'block_place' },
    conversation: { verb: 'Charla con el aldeano', instructionFallback: 'Mantén la conversación con el aldeano', icon: '💬', blockTexture: 'emerald', sfxKey: 'block_place' },
};

// Respaldo seguro para tipos desconocidos (futuros): bloque genérico.
const FALLBACK: ExerciseThemeInfo = {
    verb: 'Coloca el bloque',
    instructionFallback: 'Resuelve el ejercicio',
    icon: '🧱',
    blockTexture: 'stone',
    sfxKey: 'block_place',
};

// Devuelve la tematización de un tipo de ejercicio. Tolerante a tipos no listados.
export function exerciseTheme(type?: string | null): ExerciseThemeInfo {
    if (!type) return FALLBACK;
    return THEMES[type as ExerciseType] || FALLBACK;
}
