import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { planLesson, type MasteryRow } from '@/lib/mastery';
import type { LessonContent, Exercise, ExMeta } from '@/lib/lessonContent';

export const dynamic = 'force-dynamic';

// POST /api/lessons/plan  { activityId }
// Devuelve el ORDEN adaptativo de los ejercicios de una lección (índices sobre el
// `content.exercises` original) según el dominio del alumno (user_concept_mastery)
// y sus repasos due (get_due_reviews), reusando planLesson de @/lib/mastery:
//   present (lo renderiza el player como "fase 0") → recognize → produce → apply,
//   con los repasos due intercalados y marcados is_review.
//
// CONTRATO de salida: { order: number[], reviewIdx: number[], present?: boolean }.
//   · order      = permutación COMPLETA de [0..n-1] (el player itera en este orden).
//   · reviewIdx  = subconjunto de `order` cuyos ejercicios entran como repaso (🧭).
//   · present    = si la lección trae paso "TE MUESTRO" (el player decide mostrarlo).
//
// DEGRADACIÓN ELEGANTE (retrocompat dura): si el contenido es v1 (sin contentVersion=2
// ni meta de fase/concepto) o no hay datos de dominio, planLesson hace no-op y se
// devuelve el orden natural 0..n-1 => el player se comporta EXACTAMENTE como hoy.
// El dominio se lee server-side con service_role (admin) para no depender de RLS.

// Lee el conceptId (slug) de un ejercicio si lo trae en su envoltura meta (v2).
function conceptOf(ex: Exercise): string | undefined {
    return (ex as { meta?: ExMeta }).meta?.conceptId;
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const activityId = typeof body.activityId === 'string' ? body.activityId : null;
        if (!activityId) return NextResponse.json({ error: 'activityId requerido' }, { status: 400 });

        const admin = createAdminClient();

        // 1) Cargar el contenido de la actividad (service-side; nunca confiamos en el cliente).
        const { data: act } = await admin
            .from('activities')
            .select('content')
            .eq('id', activityId)
            .maybeSingle();

        const content = (act?.content ?? null) as LessonContent | null;
        const exercises: Exercise[] = Array.isArray(content?.exercises) ? content!.exercises : [];
        const present = !!content?.present;

        // Orden natural (fallback retrocompatible == comportamiento de hoy).
        const naturalOrder = exercises.map((_, i) => i);
        const natural = { order: naturalOrder, reviewIdx: [] as number[], present };

        // Sin ejercicios o lección v1 (sin meta v2) => no hay nada que planificar.
        const isV2 = content?.contentVersion === 2 ||
            exercises.some((ex) => {
                const m = (ex as { meta?: ExMeta }).meta;
                return !!m && (!!m.section || !!m.conceptId);
            });
        if (exercises.length === 0 || !isV2) {
            return NextResponse.json(natural);
        }

        // 2) Dominio por concepto del alumno (mapa por SLUG; el JSONB referencia por slug).
        const masteryByConcept: Record<string, MasteryRow> = {};
        try {
            const { data: rows } = await admin
                .from('user_concept_mastery')
                .select('theta, attempts, correct, half_life_hours, last_seen_at, next_review_at, band, concepts(slug)')
                .eq('user_id', user.id);
            for (const r of (rows ?? []) as Array<Record<string, unknown>>) {
                // El embed concepts(slug) puede llegar como objeto o como array (defensivo).
                const embed = r.concepts as { slug?: string } | Array<{ slug?: string }> | null;
                const slug = Array.isArray(embed) ? embed[0]?.slug : embed?.slug;
                if (!slug) continue;
                masteryByConcept[slug] = {
                    conceptId: slug,
                    theta: typeof r.theta === 'number' ? r.theta : 3.0,
                    attempts: typeof r.attempts === 'number' ? r.attempts : 0,
                    correct: typeof r.correct === 'number' ? r.correct : 0,
                    halfLifeHours: typeof r.half_life_hours === 'number' ? r.half_life_hours : 4,
                    lastSeenAt: (r.last_seen_at as string) ?? null,
                    nextReviewAt: (r.next_review_at as string) ?? null,
                    band: (r.band as string) ?? null,
                };
            }
        } catch (e) {
            console.error('[lessons/plan] mastery read', e instanceof Error ? e.message : e);
        }

        // 3) Repasos due del alumno (conceptos cuya "mena se desgastó"). Si esta lección
        //    entrena alguno de esos conceptos, ese ejercicio se inyecta como repaso (🧭).
        const dueSlugs = new Set<string>();
        try {
            const { data: due } = await admin.rpc('get_due_reviews', { p_user: user.id, p_limit: 20 });
            for (const d of (due ?? []) as Array<{ slug?: string }>) {
                if (d.slug) dueSlugs.add(d.slug);
            }
        } catch (e) {
            console.error('[lessons/plan] get_due_reviews', e instanceof Error ? e.message : e);
        }

        // 4) Separar ejercicios "nuevos" de los que sirven de repaso due, y planificar.
        const reviewPool: Exercise[] = [];
        const newPool: Exercise[] = [];
        for (const ex of exercises) {
            const c = conceptOf(ex);
            if (dueSlugs.size > 0 && c && dueSlugs.has(c)) reviewPool.push(ex);
            else newPool.push(ex);
        }

        const planned = planLesson(newPool, masteryByConcept, reviewPool);

        // 5) Traducir las referencias de ejercicio a ÍNDICES sobre el array original.
        const idxOf = new Map<Exercise, number>();
        exercises.forEach((ex, i) => { if (!idxOf.has(ex)) idxOf.set(ex, i); });

        const order: number[] = [];
        const reviewIdx: number[] = [];
        const seen = new Set<number>();
        for (const it of planned.items) {
            const i = idxOf.get(it.exercise);
            if (i === undefined || seen.has(i)) continue;
            order.push(i);
            seen.add(i);
            if (it.isReview) reviewIdx.push(i);
        }
        // Salvaguarda: garantizar permutación COMPLETA (nunca perder un ejercicio).
        for (let i = 0; i < exercises.length; i++) if (!seen.has(i)) order.push(i);

        return NextResponse.json({ order, reviewIdx, present });
    } catch (e) {
        console.error('[lessons/plan]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
