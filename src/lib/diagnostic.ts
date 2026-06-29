// Lógica server-side de la evaluación diagnóstica adaptativa:
// grading de ítems, estimación de nivel (theta, escala CEFR decimal 1-6 vía Elo/IRT-lite),
// mapeo a Banda 1-8, y sanitización del contenido (quitar respuestas) para servir al cliente.

export type Skill = 'listening' | 'reading' | 'writing' | 'speaking';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Content = any;

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// theta0 (autoubicación) solo puede ser uno de los priors legítimos del enum SELF del cliente.
// Se ajusta al más cercano para que un cliente no pueda arrancar con un prior arbitrario alto.
const THETA0_PRIORS = [1.5, 3.0, 4.0];
export function normTheta0(x: unknown): number {
    const v = typeof x === 'number' && isFinite(x) ? x : 3.0;
    return THETA0_PRIORS.reduce((best, p) => (Math.abs(p - v) < Math.abs(best - v) ? p : best), THETA0_PRIORS[0]);
}

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
            return false; // no calificable de forma segura aquí (no se usan en la diagnóstica)
        case 'speak':
        case 'speak_repeat': {
            // raw puede ser un string o un array de alternativas del reconocedor: acierta si CUALQUIERA coincide.
            if (!content.say) return false;
            const alts = Array.isArray(raw) ? raw : (typeof raw === 'string' ? [raw] : []);
            return alts.some((a) => typeof a === 'string' && textMatch(a, content.say));
        }
        case 'speak_answer':
            return typeof raw === 'string' && Array.isArray(content.accept) && content.accept.some((a: string) => textMatch(raw, a));
        default:
            return false;
    }
}

// Paso unitario del Elo/IRT-lite (REUTILIZABLE por el motor de dominio
// `src/lib/mastery.ts`, plan §3.4). Núcleo compartido:
//   p = 1 / (1 + 10^((difficulty - theta) / 1)); theta += k * ((correct?1:0) - p); clamp(1,6)
// Por defecto k = max(0.15, 0.4 * 0.9^attempts) — la escala de aprendizaje del plan
// (acertar ítems al límite de tu nivel mueve más; baja con la experiencia).
// `kOverride` permite a `estimateTheta` conservar EXACTAMENTE su propio calendario de
// k (0.7 con decaimiento 0.92 y piso 0.25) sin alterar su salida histórica.
export function eloStep(theta: number, difficulty: number, correct: boolean, attempts: number, kOverride?: number): number {
    const k = typeof kOverride === 'number' ? kOverride : Math.max(0.15, 0.4 * Math.pow(0.9, attempts));
    const p = 1 / (1 + Math.pow(10, (difficulty - theta) / 1.0));
    return clamp(theta + k * ((correct ? 1 : 0) - p), 1, 6);
}

// Estimación de habilidad estilo Elo/IRT-lite anclada a la dificultad de cada ítem:
// acertar ítems DIFÍCILES sube mucho; acertar fáciles casi no mueve (no se puede inflar
// respondiendo solo ítems fáciles). theta0 = autoubicación inicial.
// Reusa `eloStep` con su PROPIO calendario de k (kOverride) => salida idéntica a antes.
export function estimateTheta(theta0: number, graded: { difficulty: number; correct: boolean }[]): number {
    let theta = clamp(theta0, 1, 6);
    let k = 0.7;
    for (const g of graded) {
        theta = eloStep(theta, g.difficulty, g.correct, 0, k);
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

// Tipos de ítem que el reproductor diagnóstico sabe renderizar (receptivos + construcción + habla).
// 'who_said_it' se excluye a propósito: su `target` ES la respuesta en texto y no puede renderizarse
// sin exponerla al cliente (no hay forma segura con el allowlist de sanitizeContent).
export const DIAGNOSTIC_TYPES = ['text_mc', 'audio_mc', 'listen_missing_word', 'minimal_pairs', 'fill_blank', 'multi_select', 'word_bank', 'listen_build', 'speak', 'speak_repeat'];
const SPEAK_TYPES = ['speak', 'speak_repeat']; // requieren reconocimiento de voz del navegador
const ROTATION_BASE: Skill[] = ['listening', 'reading', 'writing'];

type Item = { id: string; skill: string; difficulty: number; type: string; content: Content };

// Elige el siguiente ítem no usado: prioriza la destreza objetivo (round-robin) y la
// dificultad más cercana al theta actual (máxima información), con jitter anti-exposición.
export function pickNext(items: Item[], theta: number, usedIds: Set<string>, answered: number, allowSpeaking = false): Item | null {
    // Excluye los de habla si el navegador no soporta reconocimiento de voz (caps.speech del cliente).
    const pool = items.filter((it) => !usedIds.has(it.id) && DIAGNOSTIC_TYPES.includes(it.type) && (allowSpeaking || !SPEAK_TYPES.includes(it.type)));
    if (!pool.length) return null;
    const rotation: Skill[] = allowSpeaking ? [...ROTATION_BASE, 'speaking'] : ROTATION_BASE;
    const targetSkill = rotation[answered % rotation.length];
    const preferred = pool.filter((it) => it.skill === targetSkill);
    const cand = preferred.length ? preferred : pool;
    cand.sort((a, b) => Math.abs(a.difficulty - theta) - Math.abs(b.difficulty - theta));
    const top = cand.slice(0, Math.min(3, cand.length)); // jitter: uno de los 3 más cercanos
    return top[Math.floor(Math.random() * top.length)];
}

// Regla de paro del staircase (confianza): mínimo 8, máximo 12; antes si la banda se estabiliza.
export function placementDone(theta0: number, graded: { difficulty: number; correct: boolean }[]): boolean {
    const n = graded.length;
    if (n >= 12) return true;
    if (n >= 8) {
        const band = thetaToBand(estimateTheta(theta0, graded));
        const prevBand = thetaToBand(estimateTheta(theta0, graded.slice(0, -2)));
        if (band === prevBand) return true; // estable 2 pasos
    }
    return false;
}

// Construye el contenido que se envía al cliente con ALLOWLIST por tipo: solo los campos
// estrictamente necesarios para renderizar. Cualquier campo de respuesta (correct, accept,
// answer, target, …) o de tipos no contemplados queda fuera por defecto (falla cerrado).
// NOTA (residual v1): para los tipos de listening el campo `audio` es texto y se necesita para
// la reproducción/TTS; un atacante que lea la respuesta de red puede derivar la respuesta. El
// cierre completo requiere pre-renderizar el audio y servir un audioUrl opaco (follow-up).
function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
const strOrText = (o: Content) => (typeof o === 'string' ? o : o?.text);
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function sanitizeContent(type: string, content: Content): Content {
    const src = content || {};
    const out: Content = { instruction: src.instruction };
    const opts = Array.isArray(src.options) ? src.options : [];
    // Audio opaco: enviamos la URL pre-generada (no el texto-respuesta). Solo si falta, caemos al
    // texto como red de seguridad (degradación con la fuga conocida, pero el item suena igual).
    const audioOut = () => { if (src.audioUrl) out.audioUrl = src.audioUrl; else out.audio = src.audio; };
    switch (type) {
        case 'text_mc':
            out.prompt = src.prompt; out.options = opts.map(strOrText); break;
        case 'audio_mc':
            // prompt = la PREGUNTA (se muestra); options = traducciones en español (NO se hablan).
            audioOut(); out.prompt = src.prompt; out.options = opts.map(strOrText); break;
        case 'minimal_pairs':
            audioOut(); out.options = opts.map(strOrText); break;
        case 'listen_missing_word': {
            audioOut(); out.options = opts.map(strOrText);
            // Cloze para mostrar en pantalla: la oración con la palabra correcta en BLANCO (no revela).
            const ans = strOrText(opts[src.correct]);
            if (typeof src.audio === 'string' && ans) {
                // 'gi': borra TODAS las apariciones; si no se encontró la palabra, NO mostramos cloze
                // (mostrar la oración completa filtraría la respuesta).
                const d = src.audio.replace(new RegExp('\\b' + escapeRe(String(ans).trim()) + '\\b', 'gi'), '_____');
                if (d !== src.audio) out.display = d;
            }
            break;
        }
        case 'fill_blank':
            out.before = src.before; out.after = src.after; out.options = opts.map(strOrText); break;
        case 'multi_select':
            out.prompt = src.prompt; out.options = opts.map((o: Content) => ({ text: o?.text })); break;
        case 'word_bank':
            out.prompt = src.prompt; out.tiles = shuffle(Array.isArray(src.answer) ? src.answer : []); break;
        case 'listen_build':
            audioOut(); out.prompt = src.prompt; out.tiles = shuffle(Array.isArray(src.answer) ? src.answer : []); break;
        case 'speak':
        case 'speak_repeat':
            // Leer en voz alta el texto mostrado (`say`); se verifica por similitud en el navegador.
            out.say = src.say; break;
        default:
            break; // tipo no contemplado: solo instruction (falla cerrado)
    }
    return out;
}
