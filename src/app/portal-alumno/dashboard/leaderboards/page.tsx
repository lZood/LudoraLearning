"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowUp, ArrowDown, Lock, Box, Shield } from "lucide-react";
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import { createClient } from '@/utils/supabase/client';
import { neueMachina } from '@/lib/brandFonts';

// Datos REALES (migración 0020): get_leaderboard() + get_village_chest().
type LeaderboardRow = {
    user_id: string; full_name: string; points: number; rank: number; trend: string; is_me: boolean;
    league_name: string; league_color: string;
    equipped_frame: string | null; equipped_title: string | null; equipped_name_color: string | null;
};
type VillageChest = { current: number; target: number; reached: boolean; league_name: string; members: number };

// Las 7 ligas minerales (orden + color) — para la fila de insignias de progresión (estilo Duolingo).
const LEAGUES = [
    { name: 'Madera', color: '#8B5E3C' }, { name: 'Piedra', color: '#9ca3af' }, { name: 'Hierro', color: '#cbd2d9' },
    { name: 'Oro', color: '#f59e0b' }, { name: 'Esmeralda', color: '#10b981' }, { name: 'Diamante', color: '#22d3ee' }, { name: 'Netherite', color: '#5b4a63' },
];
const PROMOTE_COUNT = 10;
const DEMOTE_COUNT = 5;
const MIN_ACTIVE_FOR_DEMOTION = 15;
const NO_DEMOTE_LEAGUES = ['Madera'];
const WEEKLY_FLOOR = 50;     // meta semanal: alcánzala y NO desciendes (solo bajan los inactivos)
const XP_PER_LESSON = 20;    // referencia para el mensaje "≈N lecciones"

function nextSundayDeadline(now: Date): Date {
    const d = new Date(now);
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
    d.setHours(23, 59, 59, 999);
    if (d.getTime() < now.getTime()) d.setDate(d.getDate() + 7);
    return d;
}
function formatCountdown(ms: number): string {
    if (ms <= 0) return '0d 0h';
    const t = Math.floor(ms / 1000), days = Math.floor(t / 86400), hours = Math.floor((t % 86400) / 3600), minutes = Math.floor((t % 3600) / 60);
    return days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}
const firstName = (full: string) => (full ?? '').trim().split(/\s+/)[0] || 'Aventurero';

export default function LeaderboardsPage() {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [ranking, setRanking] = useState<LeaderboardRow[]>([]);
    const [chest, setChest] = useState<VillageChest | null>(null);
    const [shields, setShields] = useState(0);
    const [now, setNow] = useState<Date>(() => new Date());

    useEffect(() => {
        let active = true;
        (async () => {
            setMounted(true);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            const [lbRes, chestRes, gRes] = await Promise.all([
                supabase.rpc('get_leaderboard'),
                supabase.rpc('get_village_chest'),
                user ? supabase.from('user_gamification').select('league_shields').eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
            ]);
            if (!active) return;
            const rows = (lbRes.data as LeaderboardRow[] | null) ?? [];
            rows.sort((a, b) => a.rank - b.rank);
            setRanking(rows);
            setChest((chestRes.data as VillageChest[] | null)?.[0] ?? null);
            setShields((gRes.data as { league_shields?: number } | null)?.league_shields ?? 0);
            setLoading(false);
        })();
        return () => { active = false; };
    }, []);
    useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);

    const countdown = formatCountdown(nextSundayDeadline(now).getTime() - now.getTime());
    const me = useMemo(() => ranking.find((r) => r.is_me) ?? null, [ranking]);
    const leagueName = me?.league_name ?? ranking[0]?.league_name ?? chest?.league_name ?? 'Madera';
    const currentTier = Math.max(0, LEAGUES.findIndex((l) => l.name === leagueName));
    const leagueColor = LEAGUES[currentTier]?.color ?? '#8B5E3C';
    const activeCount = ranking.length;
    const demotionEnabled = !NO_DEMOTE_LEAGUES.includes(leagueName) && activeCount >= MIN_ACTIVE_FOR_DEMOTION;
    const demoteThreshold = demotionEnabled ? activeCount - DEMOTE_COUNT + 1 : Infinity;

    const chestCurrent = chest?.current ?? 0;
    const chestTarget = Math.max(chest?.target ?? 1, 1);
    const chestPct = Math.min(100, Math.round((chestCurrent / chestTarget) * 100));
    const chestReached = chest?.reached ?? chestCurrent >= chestTarget;
    const chestMembers = chest?.members ?? activeCount;

    // Mensaje primario = META SEMANAL (asegura tu liga). Solo bajan los inactivos del fondo.
    const myMsg = useMemo(() => {
        if (!me) return null;
        if (me.points < WEEKLY_FLOOR) {
            const need = WEEKLY_FLOOR - me.points;
            const lessons = Math.max(1, Math.ceil(need / XP_PER_LESSON));
            return { tone: 'danger' as const, text: `Asegura tu liga: te faltan ${need} XP (≈${lessons} ${lessons === 1 ? 'lección' : 'lecciones'}) esta semana.` };
        }
        if (me.rank <= PROMOTE_COUNT) return { tone: 'safe' as const, text: '¡Liga asegurada y en zona de ascenso! Mantente arriba 🔥' };
        const cut = ranking.find((r) => r.rank === PROMOTE_COUNT);
        if (cut && cut.points > me.points) return { tone: 'climb' as const, text: `¡Liga asegurada! Te faltan ${cut.points - me.points + 1} XP para ascender.` };
        return { tone: 'safe' as const, text: '¡Liga asegurada esta semana! Sigue sumando para ascender.' };
    }, [me, ranking]);

    if (!mounted) return null;

    return (
        <div className="w-full min-h-screen bg-[#f5f1e4] pb-32">
            <MobileSubHeader hideNav={true} />
            <div className="w-full max-w-xl mx-auto px-4 flex flex-col">

                {/* ── PROGRESIÓN DE LIGAS (insignias minerales, estilo Duolingo/Mimo) ── */}
                <div className="pt-7 flex items-center justify-center gap-2.5 md:gap-3.5">
                    {LEAGUES.map((lg, i) => {
                        const done = i < currentTier, current = i === currentTier, locked = i > currentTier;
                        return (
                            <div key={lg.name} className="flex flex-col items-center gap-1.5" title={lg.name}>
                                <div className={`relative flex items-center justify-center rounded-xl transition-all ${current ? 'w-12 h-12 md:w-14 md:h-14' : 'w-8 h-8 md:w-9 md:h-9'}`}
                                    style={{
                                        backgroundColor: locked ? '#e4ded0' : lg.color,
                                        boxShadow: current ? `0 5px 0 rgba(0,0,0,0.18), 0 0 0 4px ${lg.color}33` : 'inset 0 -3px 0 rgba(0,0,0,0.18)',
                                        opacity: locked ? 0.7 : 1,
                                    }}>
                                    {locked ? <Lock className="w-3.5 h-3.5 text-[#9a917f]" /> : current ? <Box className="w-6 h-6 md:w-7 md:h-7 text-white drop-shadow" strokeWidth={2.5} /> : <Box className="w-4 h-4 text-white/90" strokeWidth={2.5} />}
                                </div>
                                {current && <span className="text-[8px] font-black uppercase tracking-wider" style={{ color: lg.color }}>{lg.name}</span>}
                            </div>
                        );
                    })}
                </div>

                {/* ── TÍTULO + TIMER ── */}
                <div className="mt-5 text-center">
                    <h1 className={`text-3xl md:text-4xl uppercase leading-none text-[#1a1a1a] ${neueMachina.className}`}>Liga de {leagueName}</h1>
                    <div className="mt-3 flex items-center justify-center gap-2">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#ffedcc] rounded-full">
                            <Clock className="w-3.5 h-3.5 text-[#c47d12]" />
                            <span className="text-[12px] font-black text-[#c47d12] tabular-nums">Termina en {countdown}</span>
                        </div>
                        {shields > 0 && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ede9fe] rounded-full" title="Escudos de Obsidiana: absorben un descenso">
                                <Shield className="w-3.5 h-3.5 text-[#632EB0]" fill="currentColor" />
                                <span className="text-[12px] font-black text-[#632EB0] tabular-nums">{shields}</span>
                            </div>
                        )}
                    </div>
                    <p className="mt-2.5 text-[13px] font-bold text-[#1a1a1a]/45">
                        {NO_DEMOTE_LEAGUES.includes(leagueName) ? `Top ${PROMOTE_COUNT} asciende · en Madera nadie baja` : `Haz tu meta de ${WEEKLY_FLOOR} XP y conservas tu liga · top ${PROMOTE_COUNT} asciende`}
                    </p>
                </div>

                {/* ── COFRE DE LA ALDEA ── */}
                <div className={`mt-6 rounded-2xl p-4 bg-white border ${chestReached ? 'border-[#88e04f]' : 'border-black/8'}`}>
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                            <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)] ${chestReached ? 'bg-[#5aa531]' : 'bg-amber-400'}`}><Box className="w-5 h-5" strokeWidth={2.5} /></span>
                            <div>
                                <p className="text-[13px] font-black text-[#1a1a1a] leading-none">Cofre de la Aldea</p>
                                <p className="text-[10px] font-bold text-[#1a1a1a]/40 mt-1">{chestMembers} aldeanos sumando juntos</p>
                            </div>
                        </div>
                        {chestReached && <span className="text-[9px] font-black uppercase tracking-wider text-white bg-[#5aa531] px-2.5 py-1 rounded-full">¡Logrado!</span>}
                    </div>
                    <div className="w-full h-3 bg-black/8 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${chestPct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: chestReached ? '#5aa531' : 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
                    </div>
                    <p className="text-[10px] font-black text-[#1a1a1a]/40 tabular-nums mt-1.5">{chestCurrent.toLocaleString('es-MX')} / {chestTarget.toLocaleString('es-MX')} XP</p>
                </div>

                {/* ── MENSAJE ACCIONABLE ── */}
                {myMsg && (
                    <div className={`mt-3 text-center text-[12px] font-black py-2.5 px-4 rounded-2xl ${myMsg.tone === 'danger' ? 'bg-red-50 text-red-500' : myMsg.tone === 'climb' ? 'bg-amber-50 text-amber-600' : 'bg-[#eafbe0] text-[#3f7a1e]'}`}>{myMsg.text}</div>
                )}

                {/* ── LISTA (estilo Duolingo: filas limpias, avatar circular, medallas, zonas) ── */}
                <div className="mt-6 bg-white rounded-2xl border border-black/8 overflow-hidden">
                    {loading && <div className="p-4 flex flex-col gap-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-black/5 animate-pulse" />)}</div>}
                    {!loading && ranking.length === 0 && <div className="text-center py-14 px-6 text-[#1a1a1a]/40 font-bold text-sm">Aún no hay puntos esta semana. ¡Completa lecciones para aparecer en la Liga de {leagueName}!</div>}
                    {!loading && ranking.map((row) => {
                        const rank = row.rank;
                        const inPromo = rank <= PROMOTE_COUNT;
                        // En riesgo SOLO si está en el fondo Y no alcanzó la meta semanal (inactivo).
                        const atRisk = demotionEnabled && rank >= demoteThreshold && row.points < WEEKLY_FLOOR;
                        const nameColor = row.equipped_name_color || (row.is_me ? '#632EB0' : '#1a1a1a');
                        const ringColor = row.equipped_frame || (rank <= 3 ? ['#eab308', '#9ca3af', '#cd7f32'][rank - 1] : 'transparent');
                        const avatarName = firstName(row.full_name);
                        return (
                            <React.Fragment key={row.user_id}>
                                {rank === 1 && <Zone color="#58a700" up text="Zona de Ascenso" />}
                                {rank === PROMOTE_COUNT + 1 && <div className="h-px bg-black/5 mx-4" />}
                                {demotionEnabled && rank === demoteThreshold && <Zone color="#ef4444" text="Zona de Riesgo (haz tu meta)" />}
                                <div className={`flex items-center gap-3 px-3.5 py-2.5 ${row.is_me ? 'bg-[#eafbe0]' : inPromo ? 'bg-[#88e04f]/[0.06]' : atRisk ? 'bg-red-500/[0.05]' : ''}`}>
                                    <span className="w-6 text-center font-black text-base tabular-nums shrink-0" style={{ color: rank === 1 ? '#eab308' : rank === 2 ? '#9ca3af' : rank === 3 ? '#cd7f32' : '#bdb6a6' }}>{rank}</span>
                                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#f5f1e4]" style={ringColor !== 'transparent' ? { boxShadow: `0 0 0 3px ${ringColor}` } : undefined}>
                                        <img src={`https://minotar.net/avatar/${encodeURIComponent(avatarName)}/40.png`} alt={avatarName} className="w-full h-full" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-[15px] leading-tight truncate" style={{ color: nameColor }}>{row.is_me ? `${avatarName} (Tú)` : avatarName}</p>
                                        {row.equipped_title && <p className="text-[9px] font-black uppercase tracking-wider truncate" style={{ color: leagueColor }}>{row.equipped_title}</p>}
                                    </div>
                                    <span className="font-black text-[15px] text-[#1a1a1a]/80 tabular-nums shrink-0">{row.points.toLocaleString('es-MX')} XP</span>
                                    {row.trend === 'up' ? <ArrowUp className="w-4 h-4 text-[#58a700] shrink-0" /> : row.trend === 'down' ? <ArrowDown className="w-4 h-4 text-red-400 shrink-0" /> : <span className="w-4 shrink-0" />}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function Zone({ color, up, text }: { color: string; up?: boolean; text: string }) {
    return (
        <div className="flex items-center gap-2 py-2 px-4 bg-[#fcfbf6]">
            {up ? <ArrowUp className="w-3.5 h-3.5" style={{ color }} /> : <ArrowDown className="w-3.5 h-3.5" style={{ color }} />}
            <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color }}>{text}</span>
            <div className="h-px flex-1" style={{ backgroundColor: `${color}40` }} />
            {up ? <ArrowUp className="w-3.5 h-3.5" style={{ color }} /> : <ArrowDown className="w-3.5 h-3.5" style={{ color }} />}
        </div>
    );
}
