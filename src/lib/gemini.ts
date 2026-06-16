// Modelos de Gemini centralizados (un solo lugar para cambiarlos; se pueden override por env).
//
// Dos tiers segun la tarea:
//  - FAST  (gemini-3.1-flash-lite, estable, $0.25/$1.50): alto volumen y tareas simples
//           (explicaciones cortas, texto creativo). El mas economico que admite texto/imagen/audio.
//  - SMART (gemini-3-flash-preview, $0.50/$3): conversacion con el alumno y evaluacion/grading,
//           donde importa la calidad del juicio. Mucho mas barato que 3.5-flash ($1.50/$9) y casi
//           igual de capaz para nuestras tareas. Si se quiere maxima estabilidad/calidad, poner
//           GEMINI_MODEL_SMART=gemini-3.5-flash en el entorno.
//
// Nota: para una funcion de "llamada/conversacion en vivo" (audio-a-audio en tiempo real) existe
// gemini-3.1-flash-live-preview, pero usa la Live API (streaming/websocket), NO generateContent;
// requiere una integracion aparte y es mas caro en audio ($3/$12). No se usa en estas rutas REST.
export const GEMINI_FAST = process.env.GEMINI_MODEL_FAST || 'gemini-3.1-flash-lite';
export const GEMINI_SMART = process.env.GEMINI_MODEL_SMART || 'gemini-3-flash-preview';
