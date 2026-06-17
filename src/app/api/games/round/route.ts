import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sanitizeContent } from '@/lib/diagnostic';
import { GAMES, isGameId, parseBand, bandToDifficulty } from '@/lib/games';

export const dynamic = 'force-dynamic';

// Sirve una ronda de ítems (sanitizados, sin respuestas) para un minijuego. Auth requerido.
// Lee diagnostic_items con el cliente ADMIN (la tabla tiene RLS sin policy: solo service_role).
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const gameId = body.game;
        if (!isGameId(gameId)) return NextResponse.json({ error: 'Juego inválido' }, { status: 400 });
        const game = GAMES[gameId];

        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `games-round:${user.id}`, p_max: 60, p_window: 600 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas rondas, espera un momento.' }, { status: 429 });

        // Banda del alumno -> dificultad objetivo (para escoger ítems acordes a su nivel).
        const { data: u } = await admin.from('users').select('english_level').eq('id', user.id).maybeSingle();
        const targetDif = bandToDifficulty(parseBand(u?.english_level as string | null));

        const { data: items, error } = await admin
            .from('diagnostic_items')
            .select('id, type, difficulty, content')
            .in('type', game.types);
        if (error) throw error;

        // Ordena por cercanía a la dificultad objetivo (con jitter), toma un pool y muestrea la ronda.
        const pool = (items || []).map((it) => ({ it, d: Math.abs((it.difficulty as number) - targetDif) + Math.random() * 1.2 }))
            .sort((a, b) => a.d - b.d)
            .slice(0, Math.max(game.count * 2, game.count))
            .map((x) => x.it);
        for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
        const round = pool.slice(0, game.count).map((it) => ({
            id: it.id, type: it.type, content: sanitizeContent(it.type as string, it.content),
        }));

        if (!round.length) return NextResponse.json({ error: 'Sin contenido disponible' }, { status: 503 });
        return NextResponse.json({ game: game.id, items: round });
    } catch (e) {
        console.error('[games/round]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
