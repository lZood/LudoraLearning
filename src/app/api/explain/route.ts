import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_FAST } from '@/lib/gemini';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// "Explain My Answer": al fallar un ejercicio, el tutor explica en español, breve y amable,
// por qué la respuesta correcta es correcta. Soporta seguimiento (chips: otro ejemplo, etc.).
export async function POST(req: NextRequest) {
    try {
        if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'Gemini no configurado' }, { status: 500 });
        // Requiere sesión (evita abuso de costo de IA por anónimos).
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `explain:${user.id}`, p_max: 40, p_window: 60 });
        if (rlOk === false) return NextResponse.json({ error: 'Espera un momento.' }, { status: 429 });

        const body = await req.json();
        // mode: 'why' (default, comportamiento actual) = explica por qué la correcta es correcta.
        //       'hint' = pista breve PRE-respuesta (andamiaje) SIN revelar la respuesta correcta.
        const mode: 'hint' | 'why' = body.mode === 'hint' ? 'hint' : 'why';
        const question = String(body.question ?? '').slice(0, 400);
        const correctAnswer = String(body.correctAnswer ?? '').slice(0, 200);
        const userAnswer = String(body.userAnswer ?? '').slice(0, 200);
        const messages: Array<{ role: 'user' | 'tutor'; text: string }> = Array.isArray(body.messages) ? body.messages : [];

        let prompt: string;
        if (mode === 'hint') {
            // Antorcha: pistita antes de responder. El modelo conoce la respuesta SOLO para
            // orientar, pero tiene PROHIBIDO mostrarla (ni la palabra, ni traducirla, ni deletrearla).
            const base = `Eres un tutor de inglés amable para un niño/adolescente hispanohablante (ambiente Minecraft). El alumno AÚN NO ha respondido y pide una PISTA. Da SIEMPRE en ESPAÑOL una sola pista MUY breve (1-2 frases) que lo oriente: una micro-regla, una categoría, o en qué fijarse. PROHIBIDO revelar, escribir, traducir o deletrear la respuesta correcta; no la menciones de ninguna forma. Cierra animando ("tú puedes"). Sé andamiaje, no solución.`;
            // Pasamos la correcta como contexto privado para que la pista apunte bien, con prohibición explícita.
            const ctx = `Ejercicio: ${question}\n[CONTEXTO PRIVADO — NO revelar, solo para orientar tu pista] Respuesta correcta: ${correctAnswer}`;
            prompt = `${base}\n\n${ctx}\n\nDa la pista (sin revelar la respuesta):`;
        } else {
            const base = `Eres un tutor de inglés amable y claro para un niño/adolescente hispanohablante (ambiente Minecraft). Explica SIEMPRE en ESPAÑOL, breve (2-4 frases), con un ejemplo sencillo. Nunca regañes; motiva.`;
            const ctx = `Ejercicio: ${question}\nRespuesta correcta: ${correctAnswer}${userAnswer ? `\nLo que respondió el alumno: ${userAnswer}` : ''}`;
            const history = messages.slice(-8).map((m) => `${m.role === 'user' ? 'Alumno' : 'Tutor'}: ${m.text}`).join('\n');
            prompt = `${base}\n\n${ctx}\n\n${history ? history + '\nTutor:' : 'Explica por qué la respuesta correcta es correcta.'}`;
        }

        const model = genAI.getGenerativeModel({ model: GEMINI_FAST });
        const result = await model.generateContent(prompt);
        return NextResponse.json({ reply: result.response.text().trim() });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error';
        console.error('[explain]', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
