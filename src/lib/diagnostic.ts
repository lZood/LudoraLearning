// Lógica server-side de la evaluación diagnóstica adaptativa:
// grading de ítems, estimación de nivel (theta, escala CEFR decimal 1-6 vía Elo/IRT-lite),
// mapeo a Banda 1-8, y sanitización del contenido (quitar respuestas) para servir al cliente.

export type Skill = 'listening' | 'reading' | 'writing' | 'speaking';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Content = any;

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// --- Comparación de texto tolerante (para speak), sin depender de APIs del navegador ---
const norm = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ').trim();
function textMatch(transcript: string, target: string): boolean {
    const t = norm(transcript), g = norm(target);
    if (!g) return true;
    if (!t) return false;
    if (t === g || t.includes(g) || g.includes(t)) return true;
    const gw = g.split(' ').filter(Boolean);
    const tw = new Set(t.split(' '));
    return gw.length > 0 && gw.filter((w) => tw.has(w)).length / gw.length >= 0.6;
}

// Califica un ítem contra la respuesta cruda del alumno. Autoritativo (server-side).
export function gradeItem(type: string, content: Content, raw: unknown): boolean {
    switch (type) {
        case 'text_mc':
        case 'audio_mc':
        case 'who_said_it':
        case 'listen_missing_word':
        case 'minimal_pairs':
        case 'fill_blank':
            return typeof raw === 'number' && raw === content.correct;
        case 'multi_select': {
            const sel = new Set(Array.isArray(raw) ? (raw as number[]) : []);
            return Array.isArray(content.options) && content.options.every((o: Content, i: number) => sel.has(i) === !!o.correct);
        }
        case 'word_bank':
        case 'listen_build':
            return Array.isArray(raw) && Array.isArray(content.answer) && (raw as string[]).join(' ').trim() === content.answer.join(' ').trim();
        case 'match_pairs':
        case 'tap_pairs_audio':
            return raw === true; // el player solo completa con emparejamientos correctos
        case 'speak':
        case 'speak_repeat':
            return typeof raw === 'string' && textMatch(raw, content.say || '');
        case 'speak_answer':
            return typeof raw === 'string' && Array.isArray(content.accept) && content.accept.some((a: string) => textMatch(raw, a));
        default:
            return false;
    }
}

// Estimación de habilidad estilo Elo/IRT-lite anclada a la dificultad de cada ítem:
// acertar ítems DIFÍCILES sube mucho; acertar fáciles casi no mueve (no se puede inflar
// respondiendo solo ítems fáciles). theta0 = autoubicación inicial.
export function estimateTheta(theta0: number, graded: { difficulty: number; correct: boolean }[]): number {
    let theta = clamp(theta0, 1, 6);
    let k = 0.7;
    for (const g of graded) {
        const p = 1 / (1 + Math.pow(10, (g.difficulty - theta) / 1.0));
        theta = clamp(theta + k * ((g.correct ? 1 : 0) - p), 1, 6);
        k = Math.max(0.25, k * 0.92);
    }
    return theta;
}

// theta (1-6) -> Banda (1-8): inversa de difOf(band)=1+(band-1)*(5/7) usada al sembrar.
export function thetaToBand(theta: number): number {
    return clamp(Math.round(1 + (theta - 1) * (7 / 5)), 1, 8);
}
export function bandToCefr(band: number): string {
    return band <= 2 ? 'A1' : band <= 4 ? 'A2' : band <= 6 ? 'B1' : 'B2';
}
export function bandTitle(band: number): string {
    return band <= 1 ? 'Iniciación Inmersiva' : band <= 2 ? 'Básico Funcional' : band <= 4 ? 'Aventurero Independiente' : band <= 6 ? 'Explorador Fluido' : 'Maestro Aventurero';
}

// Quita las respuestas del contenido antes de enviarlo al cliente (no se puede hacer trampa).
export function sanitizeContent(type: string, content: Content): Content {
    const c = JSON.parse(JSON.stringify(content));
    if (['text_mc', 'audio_mc', 'who_said_it', 'listen_missing_word', 'minimal_pairs', 'fill_blank'].includes(type)) {
        delete c.correct;
    }
    if (type === 'multi_select' && Array.isArray(c.options)) {
        c.options = c.options.map((o: Content) => ({ text: o.text }));
    }
    if (type === 'speak_answer') delete c.accept;
    return c;
}
