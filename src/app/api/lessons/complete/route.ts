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

        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `lesson:${user.id}`, p_max: 60, p_window: 600 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });

        const { data, error } = await admin.rpc('complete_lesson', { p_user_id: user.id, p_activity_id: activityId });
        if (error) {
            console.error('[lessons/complete]', error.message);
            return NextResponse.json({ error: 'No se pudo completar la lección.' }, { status: 400 });
        }
        const row = Array.isArray(data) ? data[0] : data;
        return NextResponse.json({ xpEarned: row?.xp_earned ?? 0, already: row?.already_done ?? false });
    } catch (e) {
        console.error('[lessons/complete]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
