import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getAdventure } from '@/lib/adventures';

export const dynamic = 'force-dynamic';

// Otorga la recompensa de una aventura al completarla. Una vez por aventura por día (anti-farmeo).
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const adv = getAdventure(String(body.id));
        if (!adv) return NextResponse.json({ error: 'Aventura inválida' }, { status: 400 });

        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `adventure:${user.id}`, p_max: 30, p_window: 600 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });

        // ¿Ya la completó hoy? -> no vuelve a otorgar (pero puede rejugarla).
        const today = new Date().toISOString().slice(0, 10);
        const source = `adventure:${adv.id}`;
        const { data: done } = await admin.from('activity_log').select('id').eq('user_id', user.id).eq('activity_date', today).eq('source', source).limit(1);
        if (done && done.length) return NextResponse.json({ xpEarned: 0, coinsEarned: 0, already: true });

        await supabase.rpc('grant_progress', { p_xp: adv.reward.xp, p_coins: adv.reward.coins, p_source: source }).then(() => {}, () => {});
        return NextResponse.json({ xpEarned: adv.reward.xp, coinsEarned: adv.reward.coins, already: false });
    } catch (e) {
        console.error('[adventures/complete]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
