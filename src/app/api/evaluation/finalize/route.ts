import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_SMART } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Agente de guía: a partir de una evaluación completada genera feedback DUAL
// (alumno motivacional + maestro técnico CEFR) y lo escribe en feedback_sessions.
export async function POST(req: NextRequest) {
    try {
        const { evaluationId } = await req.json();
        if (!evaluationId) return NextResponse.json({ error: 'Falta evaluationId' }, { status: 400 });

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        // Rate-limit por usuario: 5 finalizaciones/min.
        const rl = createAdminClient();
        const { data: rlOk } = await rl.rpc('check_rate_limit', { p_key: `finalize:${user.id}`, p_max: 5, p_window: 60 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });

        // RLS asegura que solo lee su propia evaluación.
        const { data: ev } = await supabase
            .from('evaluations')
            .select('id, user_id, calculated_band, category_levels, evaluation_history')
            .eq('id', evaluationId)
            .maybeSingle();
        if (!ev || ev.user_id !== user.id) {
            return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 });
        }

        const admin = createAdminClient();

        // Idempotencia: si ya hay feedback del agente para esta evaluación, no duplicar.
        const { data: existing } = await admin
            .from('feedback_sessions')
            .select('id')
            .eq('evaluation_id', evaluationId)
            .eq('author_type', 'ai_agent')
            .limit(1);
        if (existing && existing.length > 0) {
            return NextResponse.json({ ok: true, already: true });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini no configurado' }, { status: 500 });
        }

        const history = Array.isArray(ev.evaluation_history) ? ev.evaluation_history : [];
        const summary = history
            .map((h: Record<string, unknown>) =>
                `- [${h.category} ${h.level}] ${h.isCorrect ? 'OK' : 'X'} "${String(h.userAnswer ?? '').slice(0, 120)}"${h.feedback ? ' · ' + h.feedback : ''}`)
            .join('\n')
            .slice(0, 6000);

        const prompt = `Eres un agente de guía pedagógico de inglés (temática Minecraft) en LudoraLearning, para un alumno (posible menor de edad).
Banda global del alumno: ${ev.calculated_band}. Niveles por categoría: ${JSON.stringify(ev.category_levels)}.
Respuestas del alumno durante la evaluación:
${summary || '(sin detalle)'}

Devuelve ESTRICTAMENTE este JSON (sin markdown):
{
  "student": {
    "message": "2-3 frases motivacionales y claras para el ALUMNO (trato informal de tú, en español)",
    "focus": ["2-4 cosas concretas a practicar"],
    "phrases": ["2-3 frases cortas en inglés para practicar pronunciación"]
  },
  "teacher": {
    "diagnosis": "diagnóstico técnico (marco CEFR) para el MAESTRO, en español",
    "problemAreas": ["errores/áreas recurrentes detectadas"],
    "recommendations": ["2-4 recomendaciones de intervención para el maestro"]
  }
}`;

        const model = genAI.getGenerativeModel({ model: GEMINI_SMART });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('La IA no devolvió JSON válido');
        const parsed = JSON.parse(match[0]);

        const rows = [
            {
                student_id: user.id,
                author_id: null,
                author_type: 'ai_agent',
                audience: 'student',
                evaluation_id: evaluationId,
                content: parsed.student?.message ?? '',
                recommendations: parsed.student ?? null,
            },
            {
                student_id: user.id,
                author_id: null,
                author_type: 'ai_agent',
                audience: 'teacher',
                evaluation_id: evaluationId,
                content: parsed.teacher?.diagnosis ?? '',
                recommendations: parsed.teacher ?? null,
            },
        ];
        const { error: insErr } = await admin.from('feedback_sessions').insert(rows);
        if (insErr) throw insErr;

        return NextResponse.json({ ok: true, student: parsed.student ?? null });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error generando feedback';
        console.error('[evaluation/finalize]', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
