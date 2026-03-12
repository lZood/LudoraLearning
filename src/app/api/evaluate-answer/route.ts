import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Instanciar SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
        }

        const body = await req.json();
        const { questionType, questionText, userAnswerText, audioBase64, audioMimeType, gradingRubric, expectedKeywords } = body;

        // Validar campos según tipo
        if (!questionText) {
            return NextResponse.json({ error: 'Falta questionText' }, { status: 400 });
        }

        if (questionType === 'text-input' && !userAnswerText) {
            return NextResponse.json({ error: 'Falta userAnswerText' }, { status: 400 });
        }

        // Configurar modelo. Usamos gemini-1.5-flash-latest por su velocidad y soporte multimedia
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let prompt = `Eres un evaluador de nivel de inglés usando el marco MCER (CEFR).
        Se le hizo la siguiente tarea o pregunta a un estudiante (contexto Minecraft): "${questionText}"
        Rúbrica o expectativa del maestro: "${gradingRubric || ''}"
        Palabras clave esperadas (opcionales): ${expectedKeywords ? (expectedKeywords as string[]).join(', ') : 'Ninguna'}
        `;

        if (questionType === 'text-input') {
            prompt += `\nEl estudiante ha escrito la siguiente respuesta: "${userAnswerText}"\n`;
        } else if (questionType === 'audio-record') {
            if (!audioBase64) {
                return NextResponse.json({ error: 'Falta audioBase64 para la evaluación oral.' }, { status: 400 });
            }
            prompt += `\nEscucha el siguiente audio grabado por el estudiante.\n`;
        }

        prompt += `
        Tu tarea es determinar si la respuesta del estudiante es "Correcta/Aceptable" basada en su intento de cumplir la rúbrica y las reglas básicas del inglés (perdonando errores ortográficos menores que no impidan la comprensión, especialmente si es un nivel bajo).
        
        Devuelve tu respuesta estrictamente en formato JSON con dos parámetros:
        {
          "isCorrect": boolean, // true si logró el objetivo comunicativo / rúbrica, false si está completamente perdido o dice algo incoherente.
          "feedback": string // una frase breve explicando el por qué (en español) para el dashboard del profesor.
        }
        NO devuelvas formato markdown (\`\`\`json), solo el raw JSON.
        `;

        let result;
        if (questionType === 'audio-record' && audioBase64) {
            result = await model.generateContent([
                { text: prompt },
                {
                    inlineData: {
                        data: audioBase64,
                        mimeType: audioMimeType || 'audio/webm'
                    }
                }
            ]);
        } else {
            result = await model.generateContent(prompt);
        }

        const responseText = result.response.text().trim();

        // Limpiar posible formato markdown que la IA suele añadir
        let cleanedJson = responseText;
        if (cleanedJson.startsWith('```json')) cleanedJson = cleanedJson.replace('```json', '');
        if (cleanedJson.startsWith('```')) cleanedJson = cleanedJson.replace('```', '');
        cleanedJson = cleanedJson.replace(/```$/, '').trim();

        // Extracción segura del JSON usando regex por si la IA añade texto extra
        const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('La IA no devolvió un JSON válido: ' + responseText);
        }

        const jsonResult = JSON.parse(jsonMatch[0]);

        return NextResponse.json(jsonResult, { status: 200 });

    } catch (err: any) {
        console.error('Error en Gemini Evaluation API:', err);
        return NextResponse.json(
            { error: err.message || 'Error interno evaluando respuesta' },
            { status: 500 }
        );
    }
}
