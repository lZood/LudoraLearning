// Modelos de Gemini centralizados (un solo lugar para cambiarlos; override por env).
//
// Elegidos tras evaluar precio + latencia real + disponibilidad (scripts/ai/probe-models.mjs):
//  - FAST  = gemini-2.5-flash-lite ($0.10 in / $0.40 out): el MÁS barato disponible y el más
//            rápido (~500ms). Tareas simples / alto volumen (explain, generate-vision).
//  - SMART = gemini-2.5-flash ($0.30 in / $2.50 out): conversación (lesson-chat) y grading
//            (evaluate-answer, evaluation/finalize). Estable (GA), rápido (~3s) y más barato que
//            gemini-3-flash-preview ($0.50/$3, que además salió LENTO ~8s y es "preview").
//
// Override por entorno: GEMINI_MODEL_FAST / GEMINI_MODEL_SMART (sin tocar código, solo redeploy).
// Si Google deprecara la familia 2.5 (los 2.0 ya devuelven 404), subir a:
//   FAST -> gemini-3.1-flash-lite | SMART -> gemini-3-flash-preview o gemini-3.5-flash.
//
// Nota: para "llamada/conversación en vivo" (audio-a-audio en tiempo real) existe
// gemini-3.1-flash-live-preview, pero usa la Live API (streaming), NO generateContent.
export const GEMINI_FAST = process.env.GEMINI_MODEL_FAST || 'gemini-2.5-flash-lite';
export const GEMINI_SMART = process.env.GEMINI_MODEL_SMART || 'gemini-2.5-flash';
