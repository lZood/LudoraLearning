'use client';

// "Mesa de Encantamientos" — dominio por concepto/destreza del alumno (Track E / F5).
// Cada concepto dominado se muestra como un Encantamiento I–V sobre la herramienta de
// su destreza (Brújula/Libro/Yunque/Campana/Afinador/Pico). Consume datos de mastery
// (theta o masteryPct por concepto). Autocontenido y demo-able con props mock.
//
// Fuente real: vista v_user_enchantments (0032) o el rollup de user_concept_mastery.
// Aquí solo se renderiza; no se calcula dominio (eso lo decide el motor server-side).

import React from 'react';
import { romanLevel, label as enchantLabel } from '@/lib/minecraft/enchant';
import { masteryPct as thetaToPct } from '@/lib/mastery';
import { toolForSkill } from '@/lib/minecraft/skills';

// Una entrada de dominio (un concepto). masteryPct tiene prioridad; si falta se deriva
// de theta (1–6) con la misma fórmula que mastery.ts (round(clamp((theta-1)/5,0,1)*100)).
export interface EnchantEntry {
    conceptId: string;
    label: string;            // nombre visible del concepto (p. ej. "Vocabulario de comida")
    skill?: string;           // destreza (agrupa + da herramienta/icono)
    masteryPct?: number;      // 0–100
    theta?: number;           // 1–6 (fallback si no hay masteryPct)
}

export interface EnchantTableProps {
    entries: EnchantEntry[];
    className?: string;
}

// Resuelve el % de dominio de una entrada (masteryPct directo o derivado de theta).
function pctOf(e: EnchantEntry): number {
    if (typeof e.masteryPct === 'number' && Number.isFinite(e.masteryPct)) {
        return Math.max(0, Math.min(100, Math.round(e.masteryPct)));
    }
    if (typeof e.theta === 'number' && Number.isFinite(e.theta)) return thetaToPct(e.theta);
    return 0;
}

// Color del orbe de encantamiento por nivel (I–V): de tenue a brillante.
const LEVEL_GLOW = ['#cfd3da', '#a6f0f5', '#7ed957', '#b69bff', 'var(--mc-enchant,#7c4dff)'];

export default function EnchantTable({ entries, className = '' }: EnchantTableProps) {
    const list = Array.isArray(entries) ? entries : [];

    // Agrupar por destreza (herramienta) para mostrar el dominio por destreza.
    const groups = React.useMemo(() => {
        const map = new Map<string, { tool: ReturnType<typeof toolForSkill>; items: EnchantEntry[] }>();
        for (const e of list) {
            const tool = toolForSkill(e.skill);
            const key = tool.tool;
            if (!map.has(key)) map.set(key, { tool, items: [] });
            map.get(key)!.items.push(e);
        }
        return Array.from(map.values());
    }, [list]);

    return (
        <section
            className={`rounded-2xl border border-black/10 bg-white p-4 shadow-sm ${className}`}
            aria-label="Mesa de Encantamientos"
        >
            <header className="mb-3 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--mc-enchant,#7c4dff)] text-lg" aria-hidden>📖</span>
                <div>
                    <h3 className="font-black leading-tight text-gray-800">Mesa de Encantamientos</h3>
                    <p className="text-xs text-gray-500">Tu dominio por concepto (Encantamiento I–V)</p>
                </div>
            </header>

            {list.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">Aún no tienes encantamientos. ¡Crafteá una receta para empezar!</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {groups.map((g) => (
                        <div key={g.tool.tool}>
                            <h4 className="mb-1.5 text-xs font-black uppercase tracking-wide text-gray-400">{g.tool.label}</h4>
                            <ul className="flex flex-col gap-2">
                                {g.items.map((e) => {
                                    const pct = pctOf(e);
                                    const lvl = romanLevel(pct);
                                    const glow = LEVEL_GLOW[Math.max(0, Math.min(4, ['I', 'II', 'III', 'IV', 'V'].indexOf(lvl)))];
                                    return (
                                        <li key={e.conceptId} className="flex items-center gap-3 rounded-xl bg-black/[0.03] p-2.5">
                                            {/* Orbe de encantamiento con el número romano. */}
                                            <span
                                                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-black text-white"
                                                style={{ background: glow, boxShadow: `0 0 10px 1px ${glow}` }}
                                                aria-hidden
                                            >
                                                {lvl}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-bold text-gray-700">{e.label}</div>
                                                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={enchantLabel(pct, e.label)}>
                                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--mc-enchant,#7c4dff)' }} />
                                                </div>
                                            </div>
                                            <span className="shrink-0 text-xs font-black tabular-nums text-gray-400">{pct}%</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
