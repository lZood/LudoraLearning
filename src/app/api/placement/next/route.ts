import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { gradeItem, estimateTheta, pickNext, placementDone, sanitizeContent, normTheta0 } from '@/lib/diagnostic';

export const dynamic = 'force-dynamic';

// Paso adaptativo de la diagnóstica, dirigido por el SERVIDOR (el cliente no conoce respuestas).
// Recibe el historial crudo [{id, raw}] + theta0; califica server-side, decide si terminó o
// elige el siguiente ítem (sanitizado) según el nivel estimado. Público (modo invitado).
export async function POST(req: NextRequest) {
    try {
        const admin = createAdminClient();
        const ip = (req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown').trim();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `placement-next:${ip}`, p_max: 120, p_window: 600 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });

        const body = await req.json();
        const history: { id: string; raw: unknown }[] = Array.isArray(body.history) ? body.history.slice(0, 40) : [];
        const theta0 = normTheta0(body.theta0);
        const allowSpeaking = !!(body.caps && body.caps.speech); // solo sirve speaking si el cliente tiene SR

        const { data: items, error } = await admin.from('diagnostic_items').select('id, skill, difficulty, type, content');
        if (error) throw error;
        const byId = new Map((items || []).map((it) => [it.id as string, it]));

        const graded: { difficulty: number; correct: boolean }[] = [];
        const used = new Set<string>();
        for (const a of history) {
            const it = byId.get(a.id);
            if (!it) continue;
            used.add(a.id);
            graded.push({ difficulty: it.difficulty as number, correct: gradeItem(it.type as string, it.content, a.raw) });
        }

        // Resultado del ÚLTIMO ítem respondido, para mostrar feedback (no revela respuestas previas).
        const lastCorrect = graded.length ? graded[graded.length - 1].correct : null;

        if (graded.length && placementDone(theta0, graded)) {
            return NextResponse.json({ done: true, count: graded.length, lastCorrect });
        }

        const theta = estimateTheta(theta0, graded);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const next = pickNext(items as any[], theta, used, graded.length, allowSpeaking);
        if (!next) return NextResponse.json({ done: true, count: graded.length, lastCorrect });

        return NextResponse.json({
            done: false,
            count: graded.length,
            lastCorrect,
            item: { id: next.id, skill: next.skill, type: next.type, content: sanitizeContent(next.type, next.content) },
        });
    } catch (e) {
        console.error('[placement/next]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
