import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { gradeItem } from '@/lib/diagnostic';

export const dynamic = 'force-dynamic';

// Califica UN ítem para dar feedback inmediato durante el juego (no otorga recompensa).
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `games-check:${user.id}`, p_max: 300, p_window: 600 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });

        const body = await req.json().catch(() => ({}));
        if (typeof body.id !== 'string') return NextResponse.json({ error: 'id requerido' }, { status: 400 });
        const { data: it } = await admin.from('diagnostic_items').select('type, content').eq('id', body.id).maybeSingle();
        if (!it) return NextResponse.json({ error: 'Ítem no encontrado' }, { status: 404 });

        return NextResponse.json({ correct: gradeItem(it.type as string, it.content, body.raw) });
    } catch (e) {
        console.error('[games/check]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
