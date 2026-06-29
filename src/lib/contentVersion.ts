// Doble-lectura de contenido v1/v2 (plan §3.1). `normalizeLesson(content)` toma el
// JSONB de `activities.content` (sea v1 o v2) y devuelve una estructura runtime
// HOMOGÉNEA para que el player no tenga que ramificar por versión.
//
// REGLA DE ORO (retrocompatibilidad dura): si el contenido es v1 (o no trae
// `present`), la salida es equivalente a hoy — mismos ejercicios, mismo orden,
// sin paso `present`. `contentVersion` ausente = 1 = comportamiento actual.
//
// Importación de tipos SOLO (type-only): no añade dependencia de runtime sobre
// lessonContent.ts, así que `lessonContent.ts` puede re-exportar `normalizeLesson`
// sin crear un ciclo en tiempo de ejecución.
import type { LessonContent, Exercise, ExMeta, PresentStep, LessonSection } from './lessonContent';

// Estructura runtime homogénea que consume el player. Para v1, `present` es null,
// `hasPresent` es false y `exercises` van tal cual (orden de autoría intacto).
export interface NormalizedLesson {
    contentVersion: 1 | 2;
    skill: LessonContent['skill'];
    mixed: boolean;
    lives: boolean;
    hasPresent: boolean;
    present: PresentStep | null;
    exercises: Exercise[];
}

// Orden canónico de fases (liberación gradual). Los ejercicios sin `section` o con
// section desconocida caen al final preservando su orden relativo (estable).
const SECTION_ORDER: Record<LessonSection, number> = { recognize: 0, produce: 1, apply: 2 };
function sectionRank(ex: Exercise): number {
    const s = (ex as { meta?: ExMeta }).meta?.section;
    return s && s in SECTION_ORDER ? SECTION_ORDER[s] : 99;
}

// Ordena por sección (recognize -> produce -> apply) de forma ESTABLE. Solo se
// aplica en v2; en v1 se respeta el orden de autoría tal cual (cero regresión).
function orderBySection(exercises: Exercise[]): Exercise[] {
    return exercises
        .map((ex, i) => ({ ex, i, r: sectionRank(ex) }))
        .sort((a, b) => (a.r - b.r) || (a.i - b.i))
        .map((x) => x.ex);
}

export function normalizeLesson(content: LessonContent): NormalizedLesson {
    const version: 1 | 2 = content?.contentVersion === 2 ? 2 : 1;
    const exercises = Array.isArray(content?.exercises) ? content.exercises : [];
    const hasPresent = version === 2 && !!content.present
        && Array.isArray(content.present.items) && content.present.items.length > 0;

    // v1 (o v2 sin present válido): salida equivalente a hoy, sin reordenar.
    if (version === 1) {
        return {
            contentVersion: 1,
            skill: content.skill,
            mixed: !!content.mixed,
            lives: false,
            hasPresent: false,
            present: null,
            exercises,
        };
    }

    // v2: estructura homogénea con present + ejercicios ordenados por fase.
    return {
        contentVersion: 2,
        skill: content.skill,
        mixed: !!content.mixed,
        lives: !!content.lives,
        hasPresent,
        present: hasPresent ? content.present! : null,
        exercises: orderBySection(exercises),
    };
}
