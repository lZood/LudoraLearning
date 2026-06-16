// Reconocimiento de voz del navegador + comparación de texto tolerante (sin servidor).
// Lo usan los ejercicios de habla para verificar al instante (sin pasar por IA).

export function normSpeech(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function lev(a: string, b: string): number {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    const d = Array.from({ length: m + 1 }, (_, i) => { const r = new Array(n + 1).fill(0); r[0] = i; return r; });
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
}
function ratio(a: string, b: string): number { const m = Math.max(a.length, b.length); return m === 0 ? 1 : 1 - lev(a, b) / m; }

// ¿Alguna de las transcripciones (alternativas del reconocedor) coincide con el objetivo?
// Capas de tolerancia: exacto/inclusión -> ratio Levenshtein>=0.8 -> >=60% de palabras clave.
export function speechMatches(transcripts: string[], target: string): boolean {
    const g = normSpeech(target);
    const gw = g.split(' ').filter(Boolean);
    if (!gw.length) return true;
    for (const tr of transcripts) {
        const t = normSpeech(tr);
        if (!t) continue;
        if (t === g || t.includes(g) || g.includes(t)) return true;
        if (ratio(t, g) >= 0.8) return true;
        const tw = new Set(t.split(' '));
        const hit = gw.filter((w) => tw.has(w)).length;
        if (hit / gw.length >= 0.6) return true;
    }
    return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getSR = (): any => (typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null);
