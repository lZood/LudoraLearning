import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Práctica conversacional: el NPC (Gemini) responde en inglés sencillo dentro del escenario,
// corrige con suavidad y mantiene al alumno practicando.
export async function POST(req: NextRequest) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini no configurado' }, { status: 500 });
        }
        const ip = (req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown').trim();
        const admin = createAdminClient();
        const { data: rlOk } = await admin.rpc('check_rate_limit', { p_key: `chat:${ip}`, p_max: 60, p_window: 60 });
        if (rlOk === false) return NextResponse.json({ error: 'Demasiados mensajes, espera un momento.' }, { status: 429 });

        const body = await req.json();
        const scenario: string = body.scenario ?? '';
        const objective: string = body.objective ?? '';
        const messages: Array<{ role: 'user' | 'npc'; text: string }> = Array.isArray(body.messages) ? body.messages : [];

        const history = messages.slice(-12).map((m) => `${m.role === 'user' ? 'Alumno' : 'NPC'}: ${m.text}`).join('\n');

        const prompt = `Eres un personaje (NPC) del juego Minecraft conversando EN INGLÉS con un alumno principiante para que practique inglés.
Escenario: ${scenario}
Objetivo del alumno: ${objective}

Reglas:
- Responde SIEMPRE en inglés MUY sencillo (nivel principiante A1), frases cortas.
- Mantente dentro del escenario; sé amable y alentador.
- Si el alumno comete un error claro de inglés, corrígelo con suavidad al final entre paréntesis y en español, p. ej.: (Tip: se dice "my name is", no "my name are").
- No reveles que eres una IA. Devuelve SOLO tu turno como NPC, sin prefijos ni comillas.

Conversación hasta ahora:
${history || '(aún no hay mensajes del alumno)'}
NPC:`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const reply = result.response.text().trim();
        return NextResponse.json({ reply });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error en el chat';
        console.error('[lesson-chat]', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
