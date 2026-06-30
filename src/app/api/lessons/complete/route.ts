import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

// Otorga el XP de una lección de forma AUTORITATIVA server-side. El XP se deriva de
// activities.xp_reward en la BD (nunca del cliente) y se paga UNA sola vez por
// (usuario, actividad) vía complete_lesson (idempotente y a prueba de reset).
// Sustituye a la antigua llamada directa a grant_progress desde el browser.
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const activityId = typeof body.activityId === 'string' ? body.activityId : null;
        if (!activityId) return NextResponse.json({ error: 'activityId requerido' }, { status: 400 });
        // F2: telemetría de intentos (solo la envía el player v2). Si no viene, comportamiento v1 idéntico.
        const attempts = Array.isArray(body.attempts) ? body.attempts.slice(0, 60) : null;

        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `lesson:${user.id}`, p_max: 60, p_window: 600 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });

        // F2 — un solo camino de escritura del dominio: telemetría + Elo/HLR por concepto.
        // service_role-only; degrada a no-op si no hay conceptos resolubles (v1 nunca llega aquí).
        let enchantments: unknown[] = [];
        if (attempts && attempts.length) {
            const { data: am, error: amErr } = await admin.rpc('apply_lesson_attempts', { p_user: user.id, p_activity: activityId, p_attempts: attempts });
            if (amErr) console.error('[lessons/complete] apply_lesson_attempts', amErr.message);
            else { const out = am as { enchantments?: unknown[] } | null; enchantments = Array.isArray(out?.enchantments) ? out!.enchantments! : []; }
        }

        // F5 — paso 2 de la orquestación (0032): XP de ENCANTAMIENTO por cruces de banda
        // REALES de este lote. Idempotente por el ledger concept_mastery_grants (sin doble
        // pago), avanza el Contrato del Aldeano "extrae_mineral_nuevo". No-op si no hubo
        // cruces (=> v1 y lecciones sin dominio nuevo solo pagan XP de Esfuerzo abajo).
        let masteryXp = 0;
        if (enchantments.length) {
            const { data: gr, error: grErr } = await admin.rpc('grant_mastery_rewards', { p_user: user.id, p_events: enchantments });
            if (grErr) console.error('[lessons/complete] grant_mastery_rewards', grErr.message);
            else { const out = gr as { masteryXp?: number } | null; masteryXp = typeof out?.masteryXp === 'number' ? out.masteryXp : 0; }
        }

        // XP de Esfuerzo (autoritativo, idempotente por actividad — igual que hoy).
        const { data, error } = await admin.rpc('complete_lesson', { p_user_id: user.id, p_activity_id: activityId });
        if (error) {
            console.error('[lessons/complete]', error.message);
            return NextResponse.json({ error: 'No se pudo completar la lección.' }, { status: 400 });
        }
        const row = Array.isArray(data) ? data[0] : data;

        // F2: desbloqueo de ruta (salvaguarda: nunca re-bloquea; no-op si no hay prereqs => como hoy).
        if (attempts && attempts.length) {
            admin.rpc('unlock_next_units', { p_user: user.id }).then(() => {}, () => {});
        }

        return NextResponse.json({ xpEarned: row?.xp_earned ?? 0, already: row?.already_done ?? false, enchantments, masteryXp });
    } catch (e) {
        console.error('[lessons/complete]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
