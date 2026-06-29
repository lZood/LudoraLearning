// Motor de dominio (núcleo puro) — plan §3.4 "Aprende Crafteando".
//
// Funciones PURAS (sin DB, sin red, sin estado global) que el orquestador llamará
// desde los RPC SECURITY DEFINER (apply_lesson_attempts) y desde /api/lessons/plan.
// Reusa el MISMO paso Elo ya probado en la diagnóstica (`eloStep` de @/lib/diagnostic),
// así dominio y diagnóstica hablan exactamente la misma escala theta (1.0–6.0).
//
// Dos mecanismos combinados:
//   1) Elo/IRT-lite  -> theta por concepto (qué tan dominado está el átomo).
//   2) HLR (Half-Life Regression) -> repaso espaciado (cuándo re-exponer el átomo).
//
// RETROCOMPATIBILIDAD: todo degrada a no-op con datos vacíos. `planLesson` sobre una
// lección v1 (sin `meta`) y sin repasos due devuelve el pool en su orden original.

import { eloStep } from '@/lib/diagnostic';
import type { Exercise, ExMeta, LessonSection } from '@/lib/lessonContent';

// --- Constantes del motor (alineadas con los DEFAULT de user_concept_mastery, 0031) ---
export const DEFAULT_THETA = 3.0;            // prior neutro si el concepto no tiene fila aún
export const DEFAULT_HALF_LIFE_HOURS = 4;    // vida media inicial (HLR)
const RESET_HALF_LIFE_HOURS = 4;             // tras un fallo, la mena vuelve a desgastarse rápido
const HALF_LIFE_GROWTH = 2.2;                // factor base de crecimiento al acertar un repaso
const MAX_HALF_LIFE_HOURS = 24 * 180;        // tope sano (~6 meses) para no "perder" conceptos
const MASTERY_THETA_MARGIN = 0.5;            // theta debe superar difficulty por este margen
const MASTERY_MIN_ATTEMPTS = 3;              // nº mínimo de intentos para considerar dominado
const HOUR_MS = 3600 * 1000;

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const isNum = (x: unknown): x is number => typeof x === 'number' && isFinite(x);

// Bandas de dominio (sirven a la gamificación: "Encantamiento" / cruces de banda).
export type MasteryBand = 'aprendiendo' | 'competente' | 'dominado';

// Fila lógica de user_concept_mastery (0031). Campos de tiempo aceptan Date|ISO|epoch-ms.
export interface MasteryRow {
    conceptId: string;
    theta: number;
    attempts: number;
    correct?: number;
    halfLifeHours?: number;
    lastSeenAt?: string | number | Date | null;
    nextReviewAt?: string | number | Date | null;
    band?: MasteryBand | string | null;
    lastCorrect?: boolean;               // resultado del último intento (para isMastered)
}

// =============================================================================
// 1) Actualización del dominio (Elo) — un intento mueve theta del concepto.
// =============================================================================

// Aplica un intento al theta del concepto reusando el paso Elo de la diagnóstica.
// Acertar ítems "al límite" (difficulty ≈ theta o por encima) mueve más; baja con la
// experiencia vía el calendario por defecto de k en `eloStep` (k = max(.15, .4*.9^attempts)).
export function updateMastery(
    theta: number,
    attempts: number,
    difficulty: number,
    correct: boolean,
): { theta: number; attempts: number } {
    const t0 = isNum(theta) ? theta : DEFAULT_THETA;
    const n = isNum(attempts) && attempts > 0 ? Math.floor(attempts) : 0;
    const d = isNum(difficulty) ? difficulty : DEFAULT_THETA;
    return { theta: eloStep(t0, d, correct, n), attempts: n + 1 };
}

// =============================================================================
// 2) Repaso espaciado (HLR) — cuándo re-exponer el concepto.
// =============================================================================

// Nueva vida media tras un intento de repaso:
//   acierto -> half_life *= ~2.2, modulado por dificultad (los bloques difíciles crecen
//             algo menos; los fáciles algo más), con tope sano.
//   fallo   -> se resetea a 4h (la mena vuelve a desgastarse pronto).
export function nextHalfLife(halfLifeHours: number, correct: boolean, difficulty: number): number {
    if (!correct) return RESET_HALF_LIFE_HOURS;
    const hl = isNum(halfLifeHours) && halfLifeHours > 0 ? halfLifeHours : DEFAULT_HALF_LIFE_HOURS;
    const d = isNum(difficulty) ? difficulty : DEFAULT_THETA;
    // Modulación: difficulty media (3.5) ≈ x2.2; más difícil reduce el factor, más fácil lo sube.
    const factor = clamp(HALF_LIFE_GROWTH * (1 + (3.5 - d) * 0.06), 1.3, 3.0);
    return Math.min(hl * factor, MAX_HALF_LIFE_HOURS);
}

// Convierte Date | ISO string | epoch-ms a epoch-ms (NaN si no es interpretable).
function toMs(value: string | number | Date | null | undefined): number {
    if (value == null) return NaN;
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'number') return value;
    const t = Date.parse(value);
    return isNum(t) ? t : NaN;
}

// Fuerza de retención actual del recuerdo: strength = 2^(-elapsedHours / halfLife) ∈ (0,1].
// 1 = recién visto / aún no ha pasado tiempo; → 0 conforme se "desgasta la mena".
// `now` es inyectable para tests deterministas.
export function reviewStrength(
    lastSeenAt: string | number | Date | null | undefined,
    halfLifeHours: number,
    now: number = Date.now(),
): number {
    const last = toMs(lastSeenAt);
    if (!isNum(last)) return 1;                                   // nunca visto: tratar como fresco
    const hl = isNum(halfLifeHours) && halfLifeHours > 0 ? halfLifeHours : DEFAULT_HALF_LIFE_HOURS;
    const elapsedHours = Math.max(0, (now - last) / HOUR_MS);
    return clamp(Math.pow(2, -elapsedHours / hl), 0, 1);
}

// Momento del próximo repaso: last_seen + half_life (en horas) -> Date.
export function nextReviewAt(
    lastSeen: string | number | Date | null | undefined,
    halfLifeHours: number,
): Date {
    const last = isNum(toMs(lastSeen)) ? toMs(lastSeen) : Date.now();
    const hl = isNum(halfLifeHours) && halfLifeHours > 0 ? halfLifeHours : DEFAULT_HALF_LIFE_HOURS;
    return new Date(last + hl * HOUR_MS);
}

// =============================================================================
// 3) Lectura del dominio (gating, gamificación, UI).
// =============================================================================

// ¿Concepto dominado? theta supera la dificultad por un margen, hay evidencia suficiente
// (≥3 intentos) y el último contacto fue un acierto. Conservador a propósito.
export function isMastered(
    theta: number,
    difficulty: number,
    attempts: number,
    lastCorrect: boolean,
): boolean {
    return (
        isNum(theta) && isNum(difficulty) &&
        theta >= difficulty + MASTERY_THETA_MARGIN &&
        isNum(attempts) && attempts >= MASTERY_MIN_ATTEMPTS &&
        !!lastCorrect
    );
}

// % de dominio para barras/HUD (sin exponer theta crudo): mapea theta 1→0%, 6→100%.
export function masteryPct(theta: number): number {
    const t = isNum(theta) ? theta : DEFAULT_THETA;
    return Math.round(clamp((t - 1) / 5, 0, 1) * 100);
}

// Banda de dominio a partir del % (para "Encantamiento I–V" / cruces de banda en P6).
export function bandFromMastery(pct: number): MasteryBand {
    const p = isNum(pct) ? pct : 0;
    if (p >= 85) return 'dominado';
    if (p >= 50) return 'competente';
    return 'aprendiendo';
}

// Atajo: banda directamente desde theta (masteryPct -> bandFromMastery).
export function bandFromTheta(theta: number): MasteryBand {
    return bandFromMastery(masteryPct(theta));
}

// =============================================================================
// 4) Planificación intra-lección (orden + repasos inyectados) — §3.4.
// =============================================================================

// Orden de las fases de liberación gradual: present ya va antes (el player lo renderiza
// como "fase 0"); aquí ordenamos los ejercicios recognize -> produce -> apply.
const SECTION_RANK: Record<LessonSection, number> = { recognize: 0, produce: 1, apply: 2 };

// Desplazamiento de dificultad objetivo por fase (sobre el theta del concepto):
// recognize "al límite por debajo" (θ−0.5), produce "al límite" (θ), apply "estirar" (θ+0.5).
const SECTION_OFFSET: Record<LessonSection, number> = { recognize: -0.5, produce: 0, apply: 0.5 };

// Inferencia de fase por tipo cuando el ejercicio no trae `meta.section` (lección sin
// secciones explícitas). Receptivo -> recognize; construcción guiada -> produce;
// abierto/contextual -> apply.
const TYPE_SECTION: Partial<Record<Exercise['type'], LessonSection>> = {
    text_mc: 'recognize', audio_mc: 'recognize', who_said_it: 'recognize',
    match_pairs: 'recognize', multi_select: 'recognize', listen_missing_word: 'recognize',
    minimal_pairs: 'recognize', tap_pairs_audio: 'recognize',
    word_bank: 'produce', fill_blank: 'produce', listen_build: 'produce',
    speak: 'produce', speak_repeat: 'produce',
    free_text: 'apply', speak_answer: 'apply', conversation: 'apply',
    dialogue: 'apply', reading_passage: 'apply', match_madness: 'apply',
};

// Un ejercicio ya situado en el plan (con su fase, concepto y dificultad resueltos).
export interface PlannedItem {
    exercise: Exercise;
    section: LessonSection;
    conceptId?: string;
    difficulty: number;
    isReview: boolean;
}

// Resultado de planLesson: secuencia ordenada + cuántos repasos se intercalaron.
export interface PlannedLesson {
    items: PlannedItem[];
    reviewCount: number;
}

type MasteryLookup = Record<string, MasteryRow> | Map<string, MasteryRow>;

function getMastery(src: MasteryLookup | undefined, conceptId: string | undefined): MasteryRow | undefined {
    if (!src || !conceptId) return undefined;
    return src instanceof Map ? src.get(conceptId) : src[conceptId];
}

function metaOf(ex: Exercise): ExMeta | undefined {
    return (ex as { meta?: ExMeta }).meta;
}

function sectionOf(ex: Exercise): LessonSection {
    return metaOf(ex)?.section ?? TYPE_SECTION[ex.type] ?? 'produce';
}

// theta del concepto del ejercicio (o prior por defecto) -> dificultad objetivo de su fase.
function targetDifficulty(ex: Exercise, mastery: MasteryLookup | undefined): number {
    const m = getMastery(mastery, metaOf(ex)?.conceptId);
    const theta = m && isNum(m.theta) ? m.theta : DEFAULT_THETA;
    return theta + SECTION_OFFSET[sectionOf(ex)];
}

function toPlanned(ex: Exercise, isReview: boolean): PlannedItem {
    const m = metaOf(ex);
    return {
        exercise: ex,
        section: sectionOf(ex),
        conceptId: m?.conceptId,
        difficulty: isNum(m?.difficulty) ? (m!.difficulty as number) : DEFAULT_THETA,
        isReview,
    };
}

// Ordena los ejercicios de una lección (present aparte) por fase de liberación gradual e
// intercala los repasos `due` (interleaving 1–3 slots, marcados isReview).
//
// v1 del motor = ORDENAR + INYECTAR. La "selección real" (máxima información sobre un banco
// grande) reusa la idea de `pickNext`: dentro de cada fase priorizamos los ítems cuya
// dificultad está más cerca del objetivo de la fase (θ + offset). Con pools pequeños esto
// es solo una reordenación estable; crecerá a selección cuando haya bancos fallback.
//
// DEGRADACIÓN: si la lección no trae `meta` (v1) y no hay repasos due, se devuelve el pool
// tal cual (no-op), preservando el comportamiento de hoy.
export function planLesson(
    pool: Exercise[],
    masteryByConcept?: MasteryLookup,
    dueReviews: Exercise[] = [],
): PlannedLesson {
    const exercises = Array.isArray(pool) ? pool : [];
    const reviews = Array.isArray(dueReviews) ? dueReviews : [];

    // No-op retrocompatible: lección v1 (sin meta de fase/concepto) y sin repasos.
    const hasV2 = exercises.some((ex) => {
        const m = metaOf(ex);
        return !!m && (!!m.section || !!m.conceptId);
    });
    if (!hasV2 && reviews.length === 0) {
        return { items: exercises.map((ex) => toPlanned(ex, false)), reviewCount: 0 };
    }

    // Orden por fase (recognize -> produce -> apply); dentro de cada fase, "máxima
    // información": menor |difficulty - objetivo de la fase| primero. `index` rompe empates
    // de forma estable (preserva el orden de autoría).
    const ordered = exercises
        .map((ex, index) => ({ ex, index, target: targetDifficulty(ex, masteryByConcept) }))
        .sort((a, b) => {
            const sr = SECTION_RANK[sectionOf(a.ex)] - SECTION_RANK[sectionOf(b.ex)];
            if (sr !== 0) return sr;
            const da = Math.abs((isNum(metaOf(a.ex)?.difficulty) ? (metaOf(a.ex)!.difficulty as number) : a.target) - a.target);
            const db = Math.abs((isNum(metaOf(b.ex)?.difficulty) ? (metaOf(b.ex)!.difficulty as number) : b.target) - b.target);
            if (da !== db) return da - db;
            return a.index - b.index;
        })
        .map(({ ex }) => toPlanned(ex, false));

    if (reviews.length === 0) {
        return { items: ordered, reviewCount: 0 };
    }

    // Intercalado de repasos: un repaso cada `gap` ejercicios "nuevos" (gap ∈ [1,3]), de modo
    // que queden espaciados y no aparezcan todos juntos al final. No empezamos por un repaso.
    const reviewItems = reviews.map((ex) => toPlanned(ex, true));
    const gap = clamp(Math.floor(ordered.length / (reviewItems.length + 1)) || 1, 1, 3);

    const items: PlannedItem[] = [];
    let ri = 0;
    let sinceReview = 0;
    for (const item of ordered) {
        items.push(item);
        sinceReview++;
        if (ri < reviewItems.length && sinceReview >= gap) {
            items.push(reviewItems[ri++]);
            sinceReview = 0;
        }
    }
    // Repasos sobrantes (pool corto): los añadimos al final para no perderlos.
    while (ri < reviewItems.length) items.push(reviewItems[ri++]);

    return { items, reviewCount: reviewItems.length };
}
