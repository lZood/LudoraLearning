import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { masteryPct } from '@/lib/mastery';

export const dynamic = 'force-dynamic';

// POST /api/units/[id]/test-out — "Atajo del mapa" (Master Plan §3.6, §5.3, F4·T4.3).
//
// Evalúa el DOMINIO ya acumulado del usuario sobre los conceptos PRIMARY de la unidad
// (unit_concepts.role='primary' ⋈ user_concept_mastery). Si supera el umbral
// (masteryPct >= 80 en la MAYORÍA de los conceptos primary), marca la unidad como
// superada sin repetir: user_progress.tested_out=true + status='completed' (el más
// alto), y dispara unlock_next_units para abrir las dependientes.
//
// v1 se basa SOLO en el dominio ya acumulado (no lanza mini-quiz). El motor adaptativo
// (estimateTheta/pickNext) puede añadirse luego como confirmación; el contrato de
// salida {passed, masteryPct, ...} no cambia.
//
// Salvaguarda (§5.3): NUNCA degrada. Si la unidad ya estaba 'completed' no la toca; el
// status solo sube. Si no hay conceptos primary o falta evidencia => passed=false
// (degradación elegante: no se puede atajar lo que no se domina).
//
// Patrón /api/lessons/complete: createClient (auth por cookie) + createAdminClient
// (service_role) para leer mastery y escribir user_progress; check_rate_limit.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id: unitId } = await ctx.params;
        if (!unitId) return NextResponse.json({ error: 'unitId requerido' }, { status: 400 });

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `testout:${user.id}`, p_max: 30, p_window: 600 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });

        // 1) Conceptos PRIMARY de la unidad.
        const { data: ucRows, error: ucErr } = await admin
            .from('unit_concepts')
            .select('concept_id, concepts(slug, label)')
            .eq('unit_id', unitId)
            .eq('role', 'primary');
        if (ucErr) {
            console.error('[units/test-out] unit_concepts', ucErr.message);
            return NextResponse.json({ error: 'No se pudo evaluar la unidad.' }, { status: 400 });
        }
        // El join embebido de Supabase tipa `concepts` como array; lo normalizamos a objeto.
        type UcRaw = { concept_id: string; concepts: { slug: string | null; label: string | null } | { slug: string | null; label: string | null }[] | null };
        const primary = ((ucRows ?? []) as unknown as UcRaw[]).map((r) => ({
            concept_id: r.concept_id,
            concepts: Array.isArray(r.concepts) ? (r.concepts[0] ?? null) : r.concepts,
        }));

        // Sin conceptos etiquetados aún => no se puede atajar (degradación segura).
        if (primary.length === 0) {
            return NextResponse.json({ passed: false, masteryPct: 0, total: 0, mastered: 0, reason: 'sin-conceptos' });
        }

        const conceptIds = primary.map((r) => r.concept_id);

        // 2) Dominio del usuario sobre esos conceptos (theta). Las filas ausentes
        //    cuentan como sin evidencia (no se puede dar por dominado lo no visto).
        const { data: mRows, error: mErr } = await admin
            .from('user_concept_mastery')
            .select('concept_id, theta')
            .eq('user_id', user.id)
            .in('concept_id', conceptIds);
        if (mErr) {
            console.error('[units/test-out] mastery', mErr.message);
            return NextResponse.json({ error: 'No se pudo evaluar la unidad.' }, { status: 400 });
        }
        const thetaByConcept = new Map<string, number>();
        for (const m of (mRows ?? []) as Array<{ concept_id: string; theta: number }>) {
            thetaByConcept.set(m.concept_id, m.theta);
        }

        // 3) % de dominio por concepto (sin fila => 0% efectivo, pct del prior no cuenta).
        const PASS_PCT = 80;
        let masteredCount = 0;
        let pctSum = 0;
        const perConcept = primary.map((r) => {
            const hasRow = thetaByConcept.has(r.concept_id);
            const pct = hasRow ? masteryPct(thetaByConcept.get(r.concept_id)!) : 0;
            if (hasRow && pct >= PASS_PCT) masteredCount += 1;
            pctSum += pct;
            return { conceptId: r.concept_id, slug: r.concepts?.slug ?? null, label: r.concepts?.label ?? null, masteryPct: pct, mastered: hasRow && pct >= PASS_PCT };
        });
        const total = primary.length;
        const overallPct = Math.round(pctSum / total);
        // Umbral: MAYORÍA estricta de conceptos primary dominados (>= PASS_PCT).
        const passed = masteredCount * 2 > total;

        // 4) Si aprueba, marca la unidad superada (no degradante) y abre dependientes.
        if (passed) {
            const { error: upErr } = await admin
                .from('user_progress')
                .upsert({
                    user_id: user.id,
                    unit_id: unitId,
                    status: 'completed',
                    tested_out: true,
                    mastery_pct: overallPct,
                    unlocked_at: new Date().toISOString(),
                }, { onConflict: 'user_id,unit_id' });
            if (upErr) {
                console.error('[units/test-out] user_progress', upErr.message);
                return NextResponse.json({ error: 'No se pudo registrar el atajo.' }, { status: 400 });
            }
            // Gating de ruta: abre las unidades cuyos prereqs cumplen (no re-bloquea).
            admin.rpc('unlock_next_units', { p_user: user.id }).then(() => {}, () => {});
        }

        return NextResponse.json({
            passed,
            masteryPct: overallPct,
            total,
            mastered: masteredCount,
            threshold: PASS_PCT,
            concepts: perConcept,
        });
    } catch (e) {
        console.error('[units/test-out]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
