import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// "Explain My Answer": al fallar un ejercicio, el tutor explica en español, breve y amable,
// por qué la respuesta correcta es correcta. Soporta seguimiento (chips: otro ejemplo, etc.).
export async function POST(req: NextRequest) {
    try {
        if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'Gemini no configurado' }, { status: 500 });
        const ip = (req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown').trim();
        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `explain:${ip}`, p_max: 40, p_window: 60 });
        if (rlOk === false) return NextResponse.json({ error: 'Espera un momento.' }, { status: 429 });

        const body = await req.json();
        const question = String(body.question ?? '').slice(0, 400);
        const correctAnswer = String(body.correctAnswer ?? '').slice(0, 200);
        const userAnswer = String(body.userAnswer ?? '').slice(0, 200);
        const messages: Array<{ role: 'user' | 'tutor'; text: string }> = Array.isArray(body.messages) ? body.messages : [];

        const base = `Eres un tutor de inglés amable y claro para un niño/adolescente hispanohablante (ambiente Minecraft). Explica SIEMPRE en ESPAÑOL, breve (2-4 frases), con un ejemplo sencillo. Nunca regañes; motiva.`;
        const ctx = `Ejercicio: ${question}\nRespuesta correcta: ${correctAnswer}${userAnswer ? `\nLo que respondió el alumno: ${userAnswer}` : ''}`;
        const history = messages.slice(-8).map((m) => `${m.role === 'user' ? 'Alumno' : 'Tutor'}: ${m.text}`).join('\n');
        const prompt = `${base}\n\n${ctx}\n\n${history ? history + '\nTutor:' : 'Explica por qué la respuesta correcta es correcta.'}`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        return NextResponse.json({ reply: result.response.text().trim() });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error';
        console.error('[explain]', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
