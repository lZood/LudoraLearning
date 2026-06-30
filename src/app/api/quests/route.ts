import { NextResponse } from 'next/server';
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

// POST — reclama el Cofre del Día. claim_daily_chest de 0032 es POR CONTRATO
// (p_user, p_quest_key) e idempotente; aquí reclamamos en lote todos los contratos
// CUMPLIDOS y AÚN no reclamados (el "Cofre del Día" único de la UI), sumando la
// recompensa. Autoritativo: el progreso/recompensa los decide el RPC, no el cliente.
export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `quests:claim:${user.id}`, p_max: 20, p_window: 600 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });

        // Asegura/lee los contratos de hoy (idempotente) y reclama los cumplidos pendientes.
        const { data: rolled, error: rollErr } = await admin.rpc('roll_daily_quests', { p_user: user.id });
        if (rollErr) {
            console.error('[quests] roll_daily_quests', rollErr.message);
            return NextResponse.json({ error: 'No se pudo abrir el cofre.' }, { status: 400 });
        }
        const quests = normalizeQuests(rolled) as Array<{ questKey?: string; done?: boolean; claimed?: boolean }>;
        const pending = quests.filter((q) => q.questKey && q.done && !q.claimed);
        if (pending.length === 0) {
            return NextResponse.json({ claimed: false, reason: 'nothing_to_claim', coins: 0, xp: 0 });
        }

        let coins = 0, xp = 0, claimedCount = 0;
        for (const q of pending) {
            const { data, error } = await admin.rpc('claim_daily_chest', { p_user: user.id, p_quest_key: q.questKey });
            if (error) { console.error('[quests] claim_daily_chest', q.questKey, error.message); continue; }
            const row = (Array.isArray(data) ? data[0] : data) as { claimed?: boolean; rewardCoins?: number; rewardXp?: number } | null;
            if (row?.claimed) { coins += row.rewardCoins ?? 0; xp += row.rewardXp ?? 0; claimedCount++; }
        }
        return NextResponse.json({ claimed: claimedCount > 0, coins, xp, count: claimedCount });
    } catch (e) {
        console.error('[quests][POST]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
