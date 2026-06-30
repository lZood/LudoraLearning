import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

// Sumideros de Esmeraldas — Track E / F5 (§3.6). Compra de:
//  - "Antorcha de Respaldo" (streak_freeze): buy_streak_freeze(p_user) de 0032,
//    service_role-authoritative (descuenta esmeraldas + suma user_gamification.streak_freezes).
//  - Cosméticos: reusa purchase_cosmetic(p_id) existente (0020), que ya es atómico,
//    valida saldo/posesión/rango y corre como authenticated (auth.uid()).
//
// El servidor es la única autoridad de saldo; el cliente solo pide el ítem.
// Patrón: createClient (auth), createAdminClient (service_role), check_rate_limit.

// Alias aceptados para la Antorcha de Respaldo (streak freeze).
const STREAK_FREEZE_ITEMS = new Set(['streak_freeze', 'buy_streak_freeze', 'antorcha_respaldo', 'antorcha']);

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const item = typeof body.item === 'string' ? body.item.trim() : '';
        if (!item) return NextResponse.json({ error: 'item requerido' }, { status: 400 });

        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `shop:${user.id}`, p_max: 30, p_window: 600 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });

        // ── Antorcha de Respaldo (streak freeze) — service_role-authoritative ──
        if (STREAK_FREEZE_ITEMS.has(item.toLowerCase())) {
            const { data, error } = await admin.rpc('buy_streak_freeze', { p_user: user.id });
            if (error) {
                const msg = error.message || '';
                console.error('[shop/buy] buy_streak_freeze', msg);
                // 'insufficient_coins' / 'max_freezes' son errores esperables.
                return NextResponse.json({ error: 'No se pudo comprar la Antorcha de Respaldo.', reason: msg }, { status: 400 });
            }
            const g = (Array.isArray(data) ? data[0] : data) as { coins?: number; streak_freezes?: number } | null;
            return NextResponse.json({ ok: true, item: 'streak_freeze', coins: g?.coins, streakFreezes: g?.streak_freezes });
        }

        // ── Cosméticos — reusa purchase_cosmetic (authenticated, atómico). Se llama con el
        // cliente del usuario porque la RPC usa auth.uid() internamente. ──
        const { data, error } = await supabase.rpc('purchase_cosmetic', { p_id: item });
        if (error) {
            const msg = error.message || '';
            console.error('[shop/buy] purchase_cosmetic', msg);
            // Errores esperables del RPC: cosmetic_not_found, already_owned, insufficient_coins,
            // league_locked, not_purchasable.
            return NextResponse.json({ error: 'No se pudo comprar el cosmético.', reason: msg }, { status: 400 });
        }
        const g = (Array.isArray(data) ? data[0] : data) as { coins?: number } | null;
        return NextResponse.json({ ok: true, item, coins: g?.coins });
    } catch (e) {
        console.error('[shop/buy]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
