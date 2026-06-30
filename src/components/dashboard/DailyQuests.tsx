'use client';

// "Contratos del Aldeano" — metas diarias estilo trades (Track E / F5, §2 glosario).
// Autocontenido y demo-able con props mock (no exige red). Barra de progreso por
// contrato + reclamo del Cofre del Día cuando todos están completos.
//
// Datos reales: GET /api/quests (lista) + POST /api/quests (claim_daily_chest).
// Aquí solo se renderiza lo que llega por props; el progreso/recompensa los decide
// el servidor (un solo camino de escritura).

import React from 'react';
import { Gem, Sparkles, Lock, Check, Loader2 } from 'lucide-react';

// Un contrato del aldeano (forma normalizada por /api/quests).
export interface Quest {
    id: string;
    title: string;
    description?: string;
    icon?: string;            // emoji decorativo
    goal: number;             // meta (p. ej. 3 lecciones)
    progress: number;         // avance actual
    rewardCoins?: number;     // esmeraldas al cofre
    rewardXp?: number;        // XP al cofre
    completed?: boolean;      // override; si no, se deriva de progress>=goal
}

export interface DailyQuestsProps {
    quests: Quest[];
    /** ¿el Cofre del Día ya fue reclamado hoy? */
    chestClaimed?: boolean;
    /** reclamo del cofre (POST /api/quests). Puede ser async. */
    onClaim?: () => Promise<void> | void;
    /** recompensa total del cofre (decorativa, para el botón). */
    chestCoins?: number;
    chestXp?: number;
    className?: string;
}

const isDone = (q: Quest) => q.completed ?? q.progress >= q.goal;

export default function DailyQuests({
    quests,
    chestClaimed = false,
    onClaim,
    chestCoins,
    chestXp,
    className = '',
}: DailyQuestsProps) {
    const [claiming, setClaiming] = React.useState(false);
    const list = Array.isArray(quests) ? quests : [];
    const allDone = list.length > 0 && list.every(isDone);
    const canClaim = allDone && !chestClaimed;

    async function handleClaim() {
        if (!canClaim || claiming || !onClaim) return;
        setClaiming(true);
        try { await onClaim(); } finally { setClaiming(false); }
    }

    return (
        <section
            className={`rounded-2xl border border-black/10 bg-white p-4 shadow-sm ${className}`}
            aria-label="Contratos del Aldeano"
        >
            <header className="mb-3 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--mc-plank,#d2a878)] text-lg" aria-hidden>📜</span>
                <div>
                    <h3 className="font-black leading-tight text-gray-800">Contratos del Aldeano</h3>
                    <p className="text-xs text-gray-500">Metas de hoy · abre el cofre al cumplirlas</p>
                </div>
            </header>

            {list.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">El aldeano aún no tiene contratos para ti.</p>
            ) : (
                <ul className="flex flex-col gap-2.5">
                    {list.map((q) => {
                        const done = isDone(q);
                        const pct = Math.max(0, Math.min(100, Math.round((q.progress / Math.max(1, q.goal)) * 100)));
                        return (
                            <li key={q.id} className="rounded-xl bg-black/[0.03] p-3">
                                <div className="mb-1.5 flex items-center gap-2">
                                    <span className="text-lg" aria-hidden>{q.icon ?? (done ? '✅' : '⛏️')}</span>
                                    <span className={`flex-1 text-sm font-bold ${done ? 'text-[var(--mc-emerald-d,#1f9d57)]' : 'text-gray-700'}`}>
                                        {q.title}
                                    </span>
                                    <span className="shrink-0 text-xs font-black tabular-nums text-gray-500">
                                        {Math.min(q.progress, q.goal)}/{q.goal}
                                    </span>
                                </div>
                                {/* Barra de progreso (estilo bloque). */}
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuemin={0} aria-valuemax={q.goal} aria-valuenow={Math.min(q.progress, q.goal)}>
                                    <div
                                        className="h-full rounded-full transition-[width] duration-500"
                                        style={{ width: `${pct}%`, background: done ? 'var(--mc-emerald,#2ecc71)' : 'var(--mc-xp,#7ed957)' }}
                                    />
                                </div>
                                {(q.rewardCoins || q.rewardXp) && (
                                    <div className="mt-1.5 flex items-center gap-3 text-[11px] font-bold text-gray-500">
                                        {q.rewardCoins ? <span className="inline-flex items-center gap-0.5"><Gem className="h-3.5 w-3.5 text-[var(--mc-emerald,#2ecc71)]" /> {q.rewardCoins}</span> : null}
                                        {q.rewardXp ? <span className="inline-flex items-center gap-0.5"><Sparkles className="h-3.5 w-3.5 text-[var(--mc-xp,#7ed957)]" /> {q.rewardXp} XP</span> : null}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Cofre del Día. */}
            <button
                type="button"
                onClick={handleClaim}
                disabled={!canClaim || claiming}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed ${
                    canClaim ? 'bg-[var(--mc-chest,#b5793b)] hover:brightness-105' : 'bg-gray-300'
                }`}
            >
                {claiming ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Abriendo…</>
                ) : chestClaimed ? (
                    <><Check className="h-5 w-5" /> Cofre reclamado hoy</>
                ) : canClaim ? (
                    <><span className="text-lg" aria-hidden>🎁</span> Abrir Cofre del Día{(chestCoins || chestXp) ? ` · +${chestCoins ?? 0}🟢` : ''}</>
                ) : (
                    <><Lock className="h-4 w-4" /> Completa los contratos</>
                )}
            </button>
        </section>
    );
}
