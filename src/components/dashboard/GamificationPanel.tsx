'use client';

// Panel de gamificación por dominio del dashboard (F5): "Contratos del Aldeano"
// (metas diarias) + "Racha de antorchas" (+ Antorcha de Respaldo). Autocontenido:
// consume GET /api/quests al montar y delega claim/compra a los endpoints
// server-authoritative (POST /api/quests, POST /api/shop/buy). Degrada con red caída
// (muestra estado vacío, nunca rompe el dashboard). EnchantTable (dominio v2) se
// difiere hasta que el motor v2 esté live.

import React from 'react';
import DailyQuests, { type Quest } from './DailyQuests';
import StreakTorch from './StreakTorch';

export interface GamificationPanelProps {
    streak: number;
    streakFreezes: number;
    coins: number;
    todayDone: boolean;
}

// Forma cruda del contrato que devuelve /api/quests (espejo de roll_daily_quests).
interface ApiQuest {
    questKey?: string;
    label?: string;
    description?: string;
    mcIcon?: string;
    progress?: number;
    target?: number;
    rewardXp?: number;
    rewardCoins?: number;
    claimed?: boolean;
    done?: boolean;
}

const FREEZE_COST = 200; // espejo de buy_streak_freeze (0032)

// Ícono Minecraft (clave de bloque) -> emoji decorativo para el contrato.
const MC_ICON_EMOJI: Record<string, string> = {
    emerald_ore: '💚', pickaxe: '⛏️', torch: '🔥', chest: '🎁', book: '📖',
};

function toQuest(q: ApiQuest): Quest {
    return {
        id: q.questKey ?? Math.random().toString(36).slice(2),
        title: q.label ?? 'Contrato',
        description: q.description,
        icon: q.mcIcon ? MC_ICON_EMOJI[q.mcIcon] : undefined,
        goal: q.target ?? 1,
        progress: q.progress ?? 0,
        rewardCoins: q.rewardCoins,
        rewardXp: q.rewardXp,
        completed: q.done,
    };
}

export default function GamificationPanel({ streak, streakFreezes, coins, todayDone }: GamificationPanelProps) {
    const [quests, setQuests] = React.useState<Quest[]>([]);
    const [chestClaimed, setChestClaimed] = React.useState(false);
    const [freezes, setFreezes] = React.useState(streakFreezes);
    const [coinBal, setCoinBal] = React.useState(coins);
    const [notice, setNotice] = React.useState<string | null>(null);

    const loadQuests = React.useCallback(async () => {
        try {
            const res = await fetch('/api/quests', { cache: 'no-store' });
            if (!res.ok) return;
            const data = await res.json() as { quests?: ApiQuest[] };
            const raw = Array.isArray(data.quests) ? data.quests : [];
            setQuests(raw.map(toQuest));
            // El cofre está "reclamado hoy" si hay contratos cumplidos y TODOS ellos ya se reclamaron.
            const doneOnes = raw.filter((q) => q.done);
            setChestClaimed(doneOnes.length > 0 && doneOnes.every((q) => q.claimed));
        } catch { /* degrada a estado vacío */ }
    }, []);

    React.useEffect(() => { loadQuests(); }, [loadQuests]);

    async function handleClaim() {
        try {
            const res = await fetch('/api/quests', { method: 'POST' });
            const data = await res.json().catch(() => ({})) as { claimed?: boolean; coins?: number };
            if (res.ok && data.claimed) {
                if (typeof data.coins === 'number') setCoinBal((c) => c + data.coins!);
                setNotice('¡Cofre del Día abierto! 🎁');
            }
            await loadQuests();
        } catch { /* no-op */ }
    }

    async function handleBuyFreeze() {
        try {
            const res = await fetch('/api/shop/buy', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item: 'streak_freeze' }),
            });
            const data = await res.json().catch(() => ({})) as { ok?: boolean; coins?: number; streakFreezes?: number; reason?: string };
            if (res.ok && data.ok) {
                if (typeof data.streakFreezes === 'number') setFreezes(data.streakFreezes);
                if (typeof data.coins === 'number') setCoinBal(data.coins);
                setNotice('Antorcha de Respaldo comprada 🧯');
            } else {
                setNotice(data.reason === 'insufficient_coins' ? 'No tienes suficientes Esmeraldas.'
                    : data.reason === 'freeze_max' ? 'Ya tienes el máximo de Antorchas.'
                    : 'No se pudo comprar.');
            }
        } catch { /* no-op */ }
    }

    return (
        <section aria-label="Tu aldea" className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between px-1">
                <h2 className="text-lg font-black text-gray-800">Tu aldea</h2>
                <span className="text-xs font-bold text-gray-500">💚 {coinBal.toLocaleString('es-MX')} Esmeraldas</span>
            </div>
            {notice && (
                <p className="rounded-xl bg-[var(--mc-emerald,#2ecc71)]/10 px-3 py-2 text-center text-sm font-bold text-[var(--mc-emerald-d,#1f9d57)]">{notice}</p>
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <StreakTorch streak={streak} streakFreezes={freezes} todayDone={todayDone} freezeCost={FREEZE_COST} onBuyFreeze={handleBuyFreeze} />
                <DailyQuests quests={quests} chestClaimed={chestClaimed} onClaim={handleClaim} />
            </div>
        </section>
    );
}
