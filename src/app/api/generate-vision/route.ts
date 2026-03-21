import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
        }

        const body = await req.json();
        const { categoryLevels, calculatedBanda } = body;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        Eres el **Oráculo de Ludora**, un sabio místico en un mundo RPG estilo Minecraft que evalúa la esencia lingüística de los aventureros.
        
        Niveles internos del aventurero (para tu conocimiento, NO los menciones):
        - Gramática: ${categoryLevels['Gramática y Vocabulario']}
        - Oído: ${categoryLevels['Comprensión Auditiva']}
        - Habla: ${categoryLevels['Producción Oral']}
        - Escritura: ${categoryLevels['Producción Escrita']}
        - Vista: ${categoryLevels['Identificación Visual']}
        
        Su **Banda Global** es: **Banda ${calculatedBanda}**.
        
        REGLAS CRÍTICAS PARA TU VISIÓN:
        1. **NUNCA** menciones niveles técnicos como "A1", "A2", "B1", "Pre-A1", "alto", etc. Si lo haces, romperás la inmersión.
        2. No listes cada punto uno por uno. Agrupa tus observaciones en un párrafo fluido.
        3. Menciona brevemente algo que hizo bien (sus "encantamientos fuertes") y algo que debe mejorar (sus "grietas en la armadura").
        4. Sé muy breve (máximo 60-80 palabras).
        5. Usa metáforas de Minecraft/RPG (bloques, antorchas, expediciones, cuevas, armaduras).
        6. El tono debe ser místico, sabio y alentador.
        7. Habla de la "Banda ${calculatedBanda}" como su rango de aventurero.
        
        EJEMPLO DE TONO CORRECTO (No copiar):
        "¡Aventurero! He visto tu destreza al captar los susurros del viento y cómo tus cimientos de palabras son sólidos como la obsidiana. Has alcanzado el rango de Banda 2. Sin embargo, noto que tus pergaminos aún están por escribirse y tu voz debe resonar con más fuerza en las cavernas. ¡Sigue explorando y pronto tus historias serán leyenda!"
        
        IMPORTANTE: Solo devuelve el texto del veredicto, sin JSON ni markdown.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        return NextResponse.json({ vision: responseText }, { status: 200 });

    } catch (err: any) {
        console.error('Error in Vision Generation API:', err);
        return NextResponse.json(
            { error: err.message || 'Error interno generando visión' },
            { status: 500 }
        );
    }
}
