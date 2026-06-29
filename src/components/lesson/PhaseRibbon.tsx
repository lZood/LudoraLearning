'use client';

// Cinta que indica el MOMENTO de la lección (liberación gradual) — Minecraft (T1.2).
// Autocontenida y demo-able con props mock.
//
//  recognize → "RECONOCE"  (madera,   dureza 1)  — identificar el patrón
//  produce   → "CRAFTEA"   (piedra,   dureza 2)  — producir con apoyo
//  apply     → "APLICA"    (diamante, dureza 3)  — usar en contexto nuevo
//
// El color y la "dureza" del bloque crecen con la fase (paralelo a LessonHud).

import React from 'react';
import type { LessonSection } from '@/lib/lessonContent';

export interface PhaseRibbonProps {
    section: LessonSection;
    className?: string;
}

interface PhaseStyle {
    label: string;
    color: string;   // color base del bloque (token --mc-*)
    edge: string;    // color del borde/sombra
    hardness: 1 | 2 | 3;
    icon: string;    // emoji decorativo (skin, no instrucción)
}

const PHASES: Record<LessonSection, PhaseStyle> = {
    recognize: { label: 'RECONOCE', color: 'var(--mc-wood)', edge: 'var(--mc-wood-d)', hardness: 1, icon: '🪵' },
    produce: { label: 'CRAFTEA', color: 'var(--mc-stone)', edge: 'var(--mc-stone-d)', hardness: 2, icon: '🪨' },
    apply: { label: 'APLICA', color: 'var(--mc-diamond)', edge: 'var(--mc-diamond-d)', hardness: 3, icon: '💎' },
};

// Dureza -> grosor del bisel (px). Más dureza = bloque más "macizo".
const BEVEL: Record<number, number> = { 1: 3, 2: 4, 3: 5 };

export default function PhaseRibbon({ section, className = '' }: PhaseRibbonProps) {
    const p = PHASES[section] ?? PHASES.recognize;
    const bevel = BEVEL[p.hardness];

    return (
        <div className={`inline-flex items-center justify-center ${className}`}>
            <span
                className="inline-flex items-center gap-2 rounded-[8px] px-4 py-1.5 font-black uppercase tracking-wide text-[13px] text-[#1a1a1a] select-none"
                style={{
                    background: p.color,
                    boxShadow: [
                        `inset ${bevel}px ${bevel}px 0 rgba(255,255,255,0.45)`,
                        `inset -${bevel}px -${bevel}px 0 rgba(0,0,0,0.24)`,
                        `0 ${bevel}px 0 ${p.edge}`,
                    ].join(', '),
                }}
            >
                <span aria-hidden>{p.icon}</span>
                {p.label}
                {/* "picos" de dureza (1–3) como indicador no numérico. */}
                <span aria-hidden className="ml-1 tracking-[-2px]">
                    {'⛏'.repeat(p.hardness)}
                </span>
            </span>
        </div>
    );
}
