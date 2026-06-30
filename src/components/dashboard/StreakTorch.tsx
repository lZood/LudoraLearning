'use client';

// "Mantén las antorchas encendidas" — indicador de racha + Antorcha de Respaldo
// (streak freeze) — Track E / F5 (§2 glosario). Autocontenido y demo-able con props
// mock. La compra de Antorcha de Respaldo va por POST /api/shop/buy {item:'streak_freeze'}
// (server-authoritative); aquí solo se dispara el callback.

import React from 'react';
import { Flame, Loader2 } from 'lucide-react';

export interface StreakTorchProps {
    /** días de racha actuales. */
    streak: number;
    /** Antorchas de Respaldo disponibles (user_gamification.streak_freezes). */
    streakFreezes?: number;
    /** ¿ya practicó hoy? (antorcha de hoy "encendida"). */
    todayDone?: boolean;
    /** coste de una Antorcha de Respaldo (decorativo, para el botón). */
    freezeCost?: number;
    /** compra de Antorcha de Respaldo (POST /api/shop/buy). Puede ser async. */
    onBuyFreeze?: () => Promise<void> | void;
    className?: string;
}

// Nº de antorchas de la fila visual (los últimos N días).
const TORCH_ROW = 7;

export default function StreakTorch({
    streak,
    streakFreezes = 0,
    todayDone = false,
    freezeCost,
    onBuyFreeze,
    className = '',
}: StreakTorchProps) {
    const [buying, setBuying] = React.useState(false);
    const s = Math.max(0, Math.floor(streak) || 0);

    async function handleBuy() {
        if (buying || !onBuyFreeze) return;
        setBuying(true);
        try { await onBuyFreeze(); } finally { setBuying(false); }
    }

    // Fila de antorchas: las primeras `lit` encendidas (hasta TORCH_ROW); la de "hoy"
    // (última) parpadea apagada si aún no practicó.
    const lit = Math.min(TORCH_ROW, s);

    return (
        <section
            className={`rounded-2xl border border-black/10 bg-white p-4 shadow-sm ${className}`}
            aria-label="Racha de antorchas"
        >
            <header className="mb-3 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--mc-torch,#ffb547)] text-lg" aria-hidden>🔥</span>
                <div className="flex-1">
                    <h3 className="font-black leading-tight text-gray-800">
                        Racha de {s} {s === 1 ? 'día' : 'días'}
                    </h3>
                    <p className="text-xs text-gray-500">Mantén las antorchas encendidas</p>
                </div>
                <span className="text-2xl font-black tabular-nums text-[var(--mc-torch,#ffb547)]">{s}</span>
            </header>

            {/* Fila de antorchas (últimos días). */}
            <div className="flex items-center justify-between gap-1.5 px-1" aria-hidden>
                {Array.from({ length: TORCH_ROW }).map((_, i) => {
                    const isToday = i === TORCH_ROW - 1;
                    const isLit = i < lit || (isToday && todayDone);
                    const pending = isToday && !todayDone;
                    return (
                        <Flame
                            key={i}
                            className={`h-7 w-7 ${isLit ? 'text-[var(--mc-torch,#ffb547)]' : pending ? 'animate-pulse text-amber-300' : 'text-gray-200'}`}
                            fill={isLit ? 'var(--mc-torch,#ffb547)' : 'transparent'}
                            strokeWidth={2}
                        />
                    );
                })}
            </div>

            {!todayDone && (
                <p className="mt-2 text-center text-xs font-bold text-amber-500">
                    Practica hoy para encender la antorcha de hoy
                </p>
            )}

            {/* Antorcha de Respaldo (streak freeze). */}
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-black/[0.03] p-2.5">
                <span className="text-lg" aria-hidden>🧯</span>
                <div className="flex-1 leading-tight">
                    <div className="text-sm font-bold text-gray-700">Antorcha de Respaldo</div>
                    <div className="text-xs text-gray-500">Protege tu racha si faltas un día · tienes ×{Math.max(0, Math.floor(streakFreezes) || 0)}</div>
                </div>
                <button
                    type="button"
                    onClick={handleBuy}
                    disabled={buying || !onBuyFreeze}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-[var(--mc-emerald,#2ecc71)] px-3 py-1.5 text-xs font-black text-white transition active:scale-95 disabled:opacity-50"
                >
                    {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : <>+1{typeof freezeCost === 'number' ? ` · ${freezeCost}🟢` : ''}</>}
                </button>
            </div>
        </section>
    );
}
