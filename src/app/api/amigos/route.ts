import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

// API de AMIGOS (lado lectura).
//
// Las mutaciones de friendships (enviar/aceptar/rechazar) las hace el CLIENTE
// directamente contra las policies RLS existentes (insert/update/delete propios).
// Pero la RLS de `users` SOLO permite leer el perfil propio (auth.uid() = id) y la
// de `user_gamification` SOLO permite la lectura propia. Por eso, para:
//   - BUSCAR usuarios por nombre (users.full_name ilike), y
//   - mostrar la LIGA + XP de mis amigos (user_gamification + leagues),
// necesitamos un lector con service_role detrás de un endpoint autenticado.
// Aquí verificamos la sesión por cookie (createClient server) y solo entonces
// usamos el admin para resolver datos públicos mínimos (nombre, liga, XP, racha).
//
// Acciones (querystring ?action=...):
//   - search&q=<texto>   -> usuarios cuyo full_name coincide (excluye al propio
//                           usuario y a los ya relacionados); marca pending/accepted.
//   - friends            -> amigos ACEPTADOS con su liga + XP (mini-ranking).
//   - requests           -> solicitudes recibidas (pending) enriquecidas con nombre.

type SearchRow = {
    id: string;
    full_name: string | null;
    relation: 'none' | 'pending_out' | 'pending_in' | 'accepted';
};

type FriendRow = {
    id: string;
    full_name: string | null;
    xp: number;
    league_name: string | null;
    league_color: string | null;
    league_tier: number | null;
};

type RequestRow = {
    id: string;          // user_id del solicitante (emisor)
    full_name: string | null;
    created_at: string;
};

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const admin = createAdminClient();
        const action = req.nextUrl.searchParams.get('action') ?? 'friends';

        // ── Relaciones del usuario (en ambos sentidos) para excluir/etiquetar ──
        const { data: rels } = await admin
            .from('friendships')
            .select('user_id, friend_id, status')
            .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
        const relations = rels ?? [];

        // Mapa id-del-otro -> estado relativo a mí.
        const relByOther = new Map<string, SearchRow['relation']>();
        const acceptedIds: string[] = [];
        for (const r of relations) {
            const isOutgoing = r.user_id === user.id;
            const other = isOutgoing ? r.friend_id : r.user_id;
            if (r.status === 'accepted') {
                relByOther.set(other, 'accepted');
                acceptedIds.push(other);
            } else {
                // pending: distingue si yo la envié (out) o la recibí (in).
                relByOther.set(other, isOutgoing ? 'pending_out' : 'pending_in');
            }
        }

        // ─────────────────────────── BUSCAR ───────────────────────────
        if (action === 'search') {
            const q = (req.nextUrl.searchParams.get('q') ?? '').trim();
            if (q.length < 2) return NextResponse.json({ results: [] });

            // Rate limit suave sobre la búsqueda (admin = service role; el RPC es service_role).
            const { data: rlOk } = await admin.rpc('check_rate_limit', {
                p_key: `amigos_search:${user.id}`, p_max: 30, p_window: 60,
            });
            if (rlOk === false) return NextResponse.json({ error: 'Demasiadas búsquedas.' }, { status: 429 });

            // Escapa comodines de ilike para que el texto se trate como literal.
            const safe = q.replace(/[%_,]/g, (m) => `\\${m}`);
            const { data: found } = await admin
                .from('users')
                .select('id, full_name')
                .ilike('full_name', `%${safe}%`)
                .neq('id', user.id)
                .limit(20);

            const results: SearchRow[] = (found ?? []).map((u) => ({
                id: u.id,
                full_name: u.full_name,
                relation: relByOther.get(u.id) ?? 'none',
            }));
            return NextResponse.json({ results });
        }

        // ──────────────────── SOLICITUDES RECIBIDAS ────────────────────
        if (action === 'requests') {
            const incoming = relations.filter((r) => r.friend_id === user.id && r.status === 'pending');
            const senderIds = incoming.map((r) => r.user_id);
            if (senderIds.length === 0) return NextResponse.json({ requests: [] });

            const { data: profiles } = await admin
                .from('users')
                .select('id, full_name')
                .in('id', senderIds);
            const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

            // Necesitamos created_at original: re-leemos las filas pendientes entrantes.
            const { data: rows } = await admin
                .from('friendships')
                .select('user_id, created_at')
                .eq('friend_id', user.id)
                .eq('status', 'pending');
            const createdById = new Map((rows ?? []).map((r) => [r.user_id, r.created_at as string]));

            const requests: RequestRow[] = senderIds.map((sid) => ({
                id: sid,
                full_name: nameById.get(sid) ?? null,
                created_at: createdById.get(sid) ?? new Date().toISOString(),
            }));
            return NextResponse.json({ requests });
        }

        // ─────────── AMIGOS ACEPTADOS + LIGA/XP (mini-ranking) ───────────
        if (acceptedIds.length === 0) return NextResponse.json({ friends: [] });

        const [{ data: profiles }, { data: gami }] = await Promise.all([
            admin.from('users').select('id, full_name').in('id', acceptedIds),
            admin.from('user_gamification')
                .select('user_id, xp_total, current_league_id')
                .in('user_id', acceptedIds),
        ]);

        const leagueIds = [...new Set((gami ?? []).map((g) => g.current_league_id).filter(Boolean) as string[])];
        const { data: leagues } = leagueIds.length
            ? await admin.from('leagues').select('id, name, color, tier_order').in('id', leagueIds)
            : { data: [] as Array<{ id: string; name: string; color: string | null; tier_order: number }> };

        const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
        const gamiById = new Map((gami ?? []).map((g) => [g.user_id, g]));
        const leagueById = new Map((leagues ?? []).map((l) => [l.id, l]));

        const friends: FriendRow[] = acceptedIds.map((fid) => {
            const g = gamiById.get(fid);
            const league = g?.current_league_id ? leagueById.get(g.current_league_id) : null;
            return {
                id: fid,
                full_name: nameById.get(fid) ?? null,
                xp: g?.xp_total ?? 0,
                league_name: league?.name ?? null,
                league_color: league?.color ?? null,
                league_tier: league?.tier_order ?? null,
            };
        });
        // Mini-ranking: mayor XP primero.
        friends.sort((a, b) => b.xp - a.xp);
        return NextResponse.json({ friends });
    } catch (e) {
        console.error('[api/amigos]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
