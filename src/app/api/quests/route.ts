import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

// "Contratos del Aldeano" (metas diarias estilo trades) — Track E / F5 (§3.6).
// Un solo camino de escritura: las metas y el Cofre del Día se calculan/otorgan
// server-authoritative vía RPC SECURITY DEFINER de 0032. El cliente nunca decide
// progreso ni recompensa. Patrón idéntico a /api/lessons/complete (createClient
// para auth, createAdminClient para service_role, check_rate_limit).

// Forma normalizada de un contrato (lo consume DailyQuests.tsx).
interface QuestRow {
    id: string;
    code?: string;
    title?: string;
    description?: string;
    icon?: string;
    goal?: number;
    progress?: number;
    reward_coins?: number;
    reward_xp?: number;
    completed?: boolean;
    claimed?: boolean;
}

// roll_daily_quests puede devolver un array, o un objeto {quests:[...]} / setof rows.
// Lo dejamos tolerante para no acoplarnos a la forma exacta de 0032 (otro track).
function normalizeQuests(data: unknown): QuestRow[] {
    if (Array.isArray(data)) return data as QuestRow[];
    if (data && typeof data === 'object') {
        const q = (data as { quests?: unknown }).quests;
        if (Array.isArray(q)) return q as QuestRow[];
    }
    return [];
}

// GET — siembra (idempotente por día) y devuelve los contratos activos del usuario.
// roll_daily_quests(p_user) es idempotente: si ya rodó hoy, devuelve los vigentes.
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `quests:${user.id}`, p_max: 60, p_window: 600 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });

        const { data, error } = await admin.rpc('roll_daily_quests', { p_user: user.id });
        if (error) {
            console.error('[quests] roll_daily_quests', error.message);
            // Degradación elegante: sin contratos (la UI muestra estado vacío, no rompe).
            return NextResponse.json({ quests: [] });
        }
        return NextResponse.json({ quests: normalizeQuests(data) });
    } catch (e) {
        console.error('[quests][GET]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}

// POST — reclama el Cofre del Día (claim_daily_chest). Idempotente y autoritativo:
// si no hay contratos completos o ya se reclamó, el RPC lo decide (no el cliente).
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `quests:claim:${user.id}`, p_max: 20, p_window: 600 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });

        const { data, error } = await admin.rpc('claim_daily_chest', { p_user: user.id });
        if (error) {
            // 'nothing_to_claim' / 'already_claimed' son errores esperables del RPC.
            const msg = error.message || '';
            console.error('[quests] claim_daily_chest', msg);
            return NextResponse.json({ error: 'No se pudo abrir el cofre.', reason: msg }, { status: 400 });
        }
        const row = (Array.isArray(data) ? data[0] : data) as { coins?: number; xp?: number; claimed?: boolean } | null;
        return NextResponse.json({
            claimed: row?.claimed ?? true,
            coins: row?.coins ?? 0,
            xp: row?.xp ?? 0,
        });
    } catch (e) {
        console.error('[quests][POST]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
