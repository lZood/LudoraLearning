import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { gradeItem, estimateTheta, thetaToBand, bandToCefr, bandTitle, normTheta0 } from '@/lib/diagnostic';

export const dynamic = 'force-dynamic';

// Calcula la ubicación de nivel SERVER-SIDE (el cliente nunca escribe english_level):
// re-califica las respuestas crudas contra el banco, estima theta (Elo anclado a dificultad),
// mapea a Banda y persiste users.english_level + evaluations. Se llama tras el registro.
// Recompensa por completar el placement (debe coincidir con grant_progress_for de abajo).
const PLACEMENT_XP = 50;
const PLACEMENT_COINS = 20;

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `placement:${user.id}`, p_max: 10, p_window: 600 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });

        const body = await req.json();
        const answers: { id: string; raw: unknown }[] = Array.isArray(body.answers) ? body.answers.slice(0, 40) : [];
        const theta0 = normTheta0(body.theta0);
        if (!answers.length) return NextResponse.json({ error: 'Sin respuestas' }, { status: 400 });

        const ids = [...new Set(answers.map((a) => a.id).filter((x) => typeof x === 'string'))];
        const { data: items } = await admin.from('diagnostic_items').select('id, skill, difficulty, type, content').in('id', ids);
        const byId = new Map((items || []).map((it) => [it.id, it]));

        const graded: { difficulty: number; correct: boolean }[] = [];
        const perSkill: Record<string, { c: number; n: number }> = {};
        for (const a of answers) {
            const it = byId.get(a.id);
            if (!it) continue;
            const correct = gradeItem(it.type as string, it.content, a.raw);
            graded.push({ difficulty: it.difficulty as number, correct });
            const s = it.skill as string;
            (perSkill[s] ||= { c: 0, n: 0 }).n++;
            if (correct) perSkill[s].c++;
        }
        if (!graded.length) return NextResponse.json({ error: 'Ítems inválidos' }, { status: 400 });

        const theta = estimateTheta(theta0, graded);
        const band = thetaToBand(theta);
        const cefr = bandToCefr(band);
        const englishLevel = `Banda ${band}`;

        // Idempotente: el placement es de un solo uso. Si el alumno YA está ubicado, no re-pisamos
        // su banda ni insertamos otra evaluación ni otorgamos XP; devolvemos su banda guardada.
        const { data: existing } = await admin.from('users').select('has_completed_evaluation, english_level').eq('id', user.id).maybeSingle();
        const firstTime = !(existing?.has_completed_evaluation || existing?.english_level);

        let finalBand = band, finalCefr = cefr, finalLevel = englishLevel;
        if (firstTime) {
            // Persistencia autoritativa server-side (admin = service role). Si falla, no devolvemos éxito.
            const { error: upErr } = await admin.from('users').update({ english_level: englishLevel, has_completed_evaluation: true }).eq('id', user.id);
            if (upErr) {
                console.error('[placement/finalize] users.update', upErr.message);
                return NextResponse.json({ error: 'No se pudo guardar tu nivel.' }, { status: 500 });
            }
            const { error: evErr } = await admin.from('evaluations').insert({
                user_id: user.id,
                status: 'completed',
                category_levels: { cefr, theta: Math.round(theta * 100) / 100, band },
                evaluation_history: graded,
            });
            if (evErr) console.error('[placement/finalize] evaluations.insert', evErr.message);
            // XP por completar (autoritativo server-side: grant_progress_for con el user id validado).
            admin.rpc('grant_progress_for', { p_user_id: user.id, p_xp: PLACEMENT_XP, p_coins: PLACEMENT_COINS, p_source: 'placement' }).then(() => {}, () => {});
        } else {
            const m = /(\d+)/.exec(existing?.english_level || '');
            if (m) { finalBand = Math.max(1, Math.min(8, parseInt(m[1], 10))); finalCefr = bandToCefr(finalBand); finalLevel = `Banda ${finalBand}`; }
        }

        const skills = Object.fromEntries(Object.entries(perSkill).map(([s, v]) => [s, Math.round((v.c / Math.max(1, v.n)) * 100)]));
        // La recompensa solo se otorga la primera vez; reflejamos lo realmente ganado para celebrarlo en la UI.
        const xpGained = firstTime ? PLACEMENT_XP : 0;
        const coinsGained = firstTime ? PLACEMENT_COINS : 0;
        return NextResponse.json({ band: finalBand, bandTitle: bandTitle(finalBand), cefr: finalCefr, englishLevel: finalLevel, perSkill: skills, xpGained, coinsGained });
    } catch (e) {
        console.error('[placement/finalize]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
