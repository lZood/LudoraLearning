import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAdminClient } from '@/utils/supabase/admin';

// Instanciar SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MAX_AUDIO_BYTES = 6 * 1024 * 1024; // ~6 MB de audio base64 decodificado

export async function POST(req: NextRequest) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
        }

        const body = await req.json();
        let { questionType, questionText, gradingRubric, expectedKeywords } = body;
        const { questionId, userAnswerText, audioBase64, audioMimeType } = body;

        // Fuente autoritativa: si llega questionId, tomamos tipo/texto/rúbrica/keywords de la BD
        // (no confiamos en lo que mande el cliente, que ya no las recibe vía get_exam_questions).
        if (questionId) {
            const admin = createAdminClient();
            const { data: q } = await admin
                .from('questions')
                .select('type, text, grading_rubric, expected_keywords')
                .eq('id', questionId)
                .maybeSingle();
            if (q) {
                questionType = q.type;
                questionText = q.text;
                gradingRubric = q.grading_rubric ?? gradingRubric;
                expectedKeywords = q.expected_keywords ?? expectedKeywords;
            }
        }

        if (!questionText) {
            return NextResponse.json({ error: 'Falta questionText' }, { status: 400 });
        }
        if (questionType === 'text-input' && !userAnswerText) {
            return NextResponse.json({ error: 'Falta userAnswerText' }, { status: 400 });
        }

        // Validación de audio (tamaño + MIME) para acotar costos/abuso.
        if (questionType === 'audio-record' || audioBase64) {
            if (!audioBase64) {
                return NextResponse.json({ error: 'Falta audioBase64 para la evaluación oral.' }, { status: 400 });
            }
            const approxBytes = Math.floor((audioBase64 as string).length * 0.75);
            if (approxBytes > MAX_AUDIO_BYTES) {
                return NextResponse.json({ error: 'El audio es demasiado grande (máx 6MB).' }, { status: 413 });
            }
            const mt = (audioMimeType || '').toLowerCase();
            if (mt && !mt.startsWith('audio/')) {
                return NextResponse.json({ error: 'Tipo de audio inválido.' }, { status: 400 });
            }
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        let prompt = `Eres un evaluador de nivel de inglés usando el marco MCER (CEFR).
        Se le hizo la siguiente tarea o pregunta a un estudiante (contexto Minecraft): "${questionText}"
        Rúbrica o expectativa del maestro: "${gradingRubric || ''}"
        Palabras clave esperadas (opcionales): ${expectedKeywords ? (expectedKeywords as string[]).join(', ') : 'Ninguna'}
        `;

        if (questionType === 'text-input') {
            prompt += `\nEl estudiante ha escrito la siguiente respuesta: "${userAnswerText}"\n`;
        } else if (questionType === 'audio-record') {
            prompt += `\nEscucha el siguiente audio grabado por el estudiante.\n`;
        }

        prompt += `
        Tu tarea es determinar si la respuesta del estudiante es "Correcta/Aceptable" basada en su intento de cumplir la rúbrica y las reglas básicas del inglés (perdonando errores menores que no impidan la comprensión, especialmente en niveles bajos).`;

        if (questionType === 'audio-record') {
            prompt += `
        Además evalúa la PRONUNCIACIÓN del audio. Devuelve ESTRICTAMENTE este JSON (sin markdown):
        {
          "isCorrect": boolean,
          "feedback": string,        // breve, en español
          "transcript": string,      // lo que dijo el alumno (en inglés)
          "overallScore": number,    // 0-100 pronunciación global
          "accuracyScore": number,   // 0-100 precisión fonética
          "fluencyScore": number,    // 0-100 fluidez
          "notes": string            // 1 frase de mejora (español)
        }`;
        } else {
            prompt += `
        Devuelve ESTRICTAMENTE este JSON (sin markdown):
        {
          "isCorrect": boolean,      // logró el objetivo comunicativo / rúbrica
          "feedback": string         // una frase breve (en español)
        }`;
        }
        prompt += `\n        NO devuelvas markdown (\`\`\`json), solo el JSON crudo.\n        `;

        let result;
        if (questionType === 'audio-record' && audioBase64) {
            result = await model.generateContent([
                { text: prompt },
                {
                    inlineData: {
                        data: audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64,
                        mimeType: audioMimeType || 'audio/webm',
                    },
                },
            ]);
        } else {
            result = await model.generateContent(prompt);
        }

        const responseText = result.response.text().trim();

        let cleanedJson = responseText;
        if (cleanedJson.startsWith('```json')) cleanedJson = cleanedJson.replace('```json', '');
        if (cleanedJson.startsWith('```')) cleanedJson = cleanedJson.replace('```', '');
        cleanedJson = cleanedJson.replace(/```$/, '').trim();

        const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('La IA no devolvió un JSON válido: ' + responseText);
        }

        const jsonResult = JSON.parse(jsonMatch[0]);
        // Devolvemos también el crudo para auditoría (ai_raw_response).
        return NextResponse.json({ ...jsonResult, raw: responseText }, { status: 200 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error interno evaluando respuesta';
        console.error('Error en Gemini Evaluation API:', message);
        // IMPORTANTE: NO devolvemos isCorrect aquí; el cliente marca needs_human_review.
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
