// Biblia de tematización Minecraft — ENCANTAMIENTO (capa de datos pura).
// Traduce el dominio por concepto (masteryPct 0–100, derivado de theta) a un nivel de
// encantamiento I–V sobre la herramienta del alumno. Sin efectos. Ver §2 y §3.4.
//
// masteryPct = round(clamp((theta-1)/5, 0, 1) * 100)  (misma fórmula que mastery.ts).

const ROMAN = ['I', 'II', 'III', 'IV', 'V'] as const;
export type EnchantRoman = (typeof ROMAN)[number];

// Limita a 0–100.
function clampPct(pct: number): number {
    if (!Number.isFinite(pct)) return 0;
    return Math.max(0, Math.min(100, pct));
}

// masteryPct (0–100) -> nivel numérico de encantamiento 1–5.
export function enchantLevel(masteryPct: number): number {
    const p = clampPct(masteryPct);
    // 5 tramos de 20%: 0–20→1, 21–40→2, … 81–100→5.
    return Math.max(1, Math.min(5, Math.ceil(p / 20) || 1));
}

// masteryPct (0–100) -> número romano del encantamiento (I–V).
export function romanLevel(masteryPct: number): EnchantRoman {
    return ROMAN[enchantLevel(masteryPct) - 1];
}

// Etiqueta visible. Si se pasa `subject` (p. ej. "Vocabulario"), produce "Vocabulario III";
// si no, "Encantamiento III".
export function label(masteryPct: number, subject?: string): string {
    const r = romanLevel(masteryPct);
    return subject ? `${subject} ${r}` : `Encantamiento ${r}`;
}

// Convierte theta (1–6) a masteryPct, por si el llamador tiene theta y no pct.
export function thetaToMasteryPct(theta: number): number {
    const v = Number.isFinite(theta) ? theta : 1;
    return Math.round(Math.max(0, Math.min(1, (v - 1) / 5)) * 100);
}
