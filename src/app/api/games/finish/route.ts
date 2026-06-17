import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { gradeItem } from '@/lib/diagnostic';
import { GAMES, isGameId, GAME_XP_DAILY_CAP } from '@/lib/games';

export const dynamic = 'force-dynamic';

// Cierra una ronda: re-califica TODO server-side (autoritativo), otorga XP+monedas con tope diario
// anti-farmeo del leaderboard, y devuelve el resultado por ítem.
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const gameId = body.game;
        if (!isGameId(gameId)) return NextResponse.json({ error: 'Juego inválido' }, { status: 400 });
        const game = GAMES[gameId];
        const practice = body.practice === true; // modo dev: califica pero NO otorga recompensa
        const answers: { id: string; raw: unknown }[] = Array.isArray(body.answers) ? body.answers.slice(0, 50) : [];
        if (!answers.length) return NextResponse.json({ error: 'Sin respuestas' }, { status: 400 });

        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `games-finish:${user.id}`, p_max: 40, p_window: 600 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });

        const ids = [...new Set(answers.map((a) => a.id).filter((x) => typeof x === 'string'))];
        const { data: items } = await admin.from('diagnostic_items').select('id, type, content').in('id', ids);
        const byId = new Map((items || []).map((it) => [it.id as string, it]));

        const results = answers.map((a) => {
            const it = byId.get(a.id);
            return { id: a.id, correct: it ? gradeItem(it.type as string, it.content, a.raw) : false };
        });
        const correct = results.filter((r) => r.correct).length;
        const total = results.length;

        // Recompensa (antes del tope): XP por acierto + monedas por desempeño.
        const perfect = correct === total && total > 0;
        let xp = correct * game.xpPerCorrect;
        let coins = Math.floor(correct / 2) + (perfect ? 3 : 0);

        // Modo dev/práctica: devuelve el resultado pero NO otorga recompensa (no toca stats reales).
        if (practice) {
            return NextResponse.json({ correct, total, results, xpEarned: 0, coinsEarned: 0, capReached: false, practice: true });
        }

        // Tope diario de XP por minijuegos (suma de activity_log con source 'game:%' de hoy).
        const today = new Date().toISOString().slice(0, 10);
        const { data: todayRows } = await admin
            .from('activity_log').select('xp_earned, source')
            .eq('user_id', user.id).eq('activity_date', today).like('source', 'game:%');
        const usedToday = (todayRows ?? []).reduce((s, r) => s + ((r.xp_earned as number) ?? 0), 0);
        const remaining = Math.max(0, GAME_XP_DAILY_CAP - usedToday);
        const capReached = remaining <= 0;
        xp = Math.min(xp, remaining);
        if (xp <= 0) coins = 0; // alcanzado el tope: no más recompensa hoy (pero puede seguir jugando)

        if (xp > 0 || coins > 0) {
            // Como el alumno (grant_progress usa auth.uid()): suma XP/monedas + racha + leaderboard.
            await supabase.rpc('grant_progress', { p_xp: xp, p_coins: coins, p_source: `game:${game.id}` }).then(() => {}, () => {});
        }

        return NextResponse.json({ correct, total, results, xpEarned: xp, coinsEarned: coins, capReached });
    } catch (e) {
        console.error('[games/finish]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
