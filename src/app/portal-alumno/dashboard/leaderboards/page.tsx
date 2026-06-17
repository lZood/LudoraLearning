"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, ArrowUp, ArrowDown, Users, Box, CheckCircle2, ShieldCheck, AlertTriangle, TrendingUp } from "lucide-react";
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import { createClient } from '@/utils/supabase/client';
import { neueMachina } from '@/lib/brandFonts';

// ───────────────────────────────────────────────────────────────────────────
// Datos REALES (migración 0020_ranking_engine): get_leaderboard() + get_village_chest().
// ───────────────────────────────────────────────────────────────────────────
type LeaderboardRow = {
    user_id: string; full_name: string; points: number; rank: number; trend: string; is_me: boolean;
    league_name: string; league_color: string;
    equipped_frame: string | null; equipped_title: string | null; equipped_name_color: string | null;
};
type VillageChest = { current: number; target: number; reached: boolean; league_name: string; members: number };

const PROMOTE_COUNT = 10;
const DEMOTE_COUNT = 5;
const MIN_ACTIVE_FOR_DEMOTION = 15;
const NO_DEMOTE_LEAGUES = ['Madera'];
const FALLBACK_COLOR = '#632EB0';

function nextSundayDeadline(now: Date): Date {
    const d = new Date(now);
    const daysUntilSunday = (7 - d.getDay()) % 7;
    d.setDate(d.getDate() + daysUntilSunday);
    d.setHours(23, 59, 59, 999);
    if (d.getTime() < now.getTime()) d.setDate(d.getDate() + 7);
    return d;
}
function formatCountdown(msLeft: number): string {
    if (msLeft <= 0) return '0d 0h 0m';
    const t = Math.floor(msLeft / 1000);
    const days = Math.floor(t / 86400), hours = Math.floor((t % 86400) / 3600), minutes = Math.floor((t % 3600) / 60), seconds = t % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
}
const firstName = (full: string) => (full ?? '').trim().split(/\s+/)[0] || 'Aventurero';

export default function LeaderboardsPage() {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [ranking, setRanking] = useState<LeaderboardRow[]>([]);
    const [chest, setChest] = useState<VillageChest | null>(null);
    const [now, setNow] = useState<Date>(() => new Date());

    useEffect(() => {
        let active = true;
        (async () => {
            setMounted(true);
            const supabase = createClient();
            const [lbRes, chestRes] = await Promise.all([supabase.rpc('get_leaderboard'), supabase.rpc('get_village_chest')]);
            if (!active) return;
            const rows = (lbRes.data as LeaderboardRow[] | null) ?? [];
            rows.sort((a, b) => a.rank - b.rank);
            setRanking(rows);
            setChest((chestRes.data as VillageChest[] | null)?.[0] ?? null);
            setLoading(false);
        })();
        return () => { active = false; };
    }, []);

    useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

    const deadline = useMemo(() => nextSundayDeadline(now), [now]);
    const countdown = formatCountdown(deadline.getTime() - now.getTime());

    const me = useMemo(() => ranking.find((r) => r.is_me) ?? null, [ranking]);
    const leagueName = me?.league_name ?? ranking[0]?.league_name ?? chest?.league_name ?? 'Madera';
    const leagueColor = me?.league_color ?? ranking[0]?.league_color ?? FALLBACK_COLOR;
    const activeCount = ranking.length;
    const demotionEnabled = !NO_DEMOTE_LEAGUES.includes(leagueName) && activeCount >= MIN_ACTIVE_FOR_DEMOTION;
    const demoteThreshold = demotionEnabled ? activeCount - DEMOTE_COUNT + 1 : Infinity;

    const chestCurrent = chest?.current ?? 0;
    const chestTarget = Math.max(chest?.target ?? 1, 1);
    const chestPct = Math.min(100, Math.round((chestCurrent / chestTarget) * 100));
    const chestReached = chest?.reached ?? chestCurrent >= chestTarget;
    const chestMembers = chest?.members ?? activeCount;

    const myActionMessage = useMemo(() => {
        if (!me) return null;
        if (me.rank > PROMOTE_COUNT) {
            const cut = ranking.find((r) => r.rank === PROMOTE_COUNT);
            if (cut) { const need = Math.max(0, cut.points - me.points + 1); return { tone: 'climb' as const, text: need > 0 ? `Te faltan ${need.toLocaleString('es-MX')} XP para entrar a la zona de ascenso.` : '¡Estás a un paso del ascenso!' }; }
        }
        if (demotionEnabled && me.rank >= demoteThreshold) {
            const safe = ranking.find((r) => r.rank === demoteThreshold - 1);
            if (safe) { const need = Math.max(0, safe.points - me.points + 1); return { tone: 'danger' as const, text: `Zona de riesgo: gana ${need.toLocaleString('es-MX')} XP para salir del descenso.` }; }
        }
        if (me.rank <= PROMOTE_COUNT) return { tone: 'safe' as const, text: '¡Estás en zona de ascenso! Mantente arriba para subir de liga.' };
        return { tone: 'safe' as const, text: '¡Vas bien! Sigue sumando XP para escalar.' };
    }, [me, ranking, demotionEnabled, demoteThreshold]);

    if (!mounted) return null;

    return (
        <div className="w-full min-h-screen bg-[#f5f1e4] pb-32">
            <MobileSubHeader hideNav={true} />

            <div className="w-full max-w-2xl mx-auto px-4 flex flex-col">
                {/* ── CABECERA DE LIGA ── */}
                <div className="pt-8 md:pt-10 text-center flex flex-col items-center gap-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-black/10 shadow-[0_3px_0_rgba(0,0,0,0.06)]">
                        <Clock className="w-3.5 h-3.5 text-[#1a1a1a]/40" />
                        <span className="text-[11px] font-black text-[#1a1a1a]/60 uppercase tracking-widest tabular-nums">Termina en {countdown}</span>
                    </div>

                    {/* Bloque mineral de la liga (estilo Minecraft) */}
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-[0_5px_0_rgba(0,0,0,0.18)]"
                        style={{ backgroundColor: leagueColor, border: `3px solid rgba(0,0,0,0.12)` }}>
                        <Box className="w-8 h-8 text-white drop-shadow" strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: leagueColor }}>Liga de</p>
                        <h1 className={`text-4xl md:text-5xl uppercase leading-none text-[#1a1a1a] ${neueMachina.className}`}>{leagueName}</h1>
                    </div>
                    <p className="text-sm font-semibold text-[#1a1a1a]/50 max-w-md leading-snug">
                        {demotionEnabled
                            ? `Los ${PROMOTE_COUNT} mejores ascienden · los últimos ${DEMOTE_COUNT} descienden`
                            : NO_DEMOTE_LEAGUES.includes(leagueName)
                                ? `Los ${PROMOTE_COUNT} mejores ascienden · en Madera nadie baja`
                                : `Los ${PROMOTE_COUNT} mejores ascienden · esta semana sin descenso`}
                    </p>
                </div>

                {/* ── COFRE DE LA ALDEA ── */}
                <div className={`mt-8 rounded-2xl p-5 bg-white border ${chestReached ? 'border-[#88e04f]' : 'border-black/10'} shadow-[0_4px_0_rgba(0,0,0,0.06)]`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_3px_0_rgba(0,0,0,0.15)] ${chestReached ? 'bg-[#88e04f]' : 'bg-amber-400'}`}>
                                {chestReached ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Box className="w-5 h-5 text-white" />}
                            </div>
                            <div>
                                <p className="text-sm font-black text-[#1a1a1a] uppercase tracking-wide leading-none">Cofre de la Aldea</p>
                                <p className="text-[10px] font-bold text-[#1a1a1a]/40 uppercase tracking-widest mt-1 flex items-center gap-1"><Users className="w-3 h-3" /> {chestMembers} aldeanos</p>
                            </div>
                        </div>
                        {chestReached && <span className="text-[10px] font-black uppercase tracking-widest text-white bg-[#5aa531] px-3 py-1.5 rounded-full">¡Logrado!</span>}
                    </div>
                    <div className="w-full h-3.5 bg-black/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${chestPct}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} className="h-full rounded-full"
                            style={{ background: chestReached ? '#5aa531' : 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] font-black text-[#1a1a1a]/70 tabular-nums">{chestCurrent.toLocaleString('es-MX')} / {chestTarget.toLocaleString('es-MX')} XP</span>
                        <span className="text-[11px] font-black text-[#1a1a1a]/30 tabular-nums">{chestPct}%</span>
                    </div>
                </div>

                {/* ── MENSAJE ACCIONABLE ── */}
                {myActionMessage && (
                    <div className={`mt-4 flex items-center gap-3 rounded-2xl px-4 py-3.5 border shadow-[0_3px_0_rgba(0,0,0,0.05)] ${myActionMessage.tone === 'danger' ? 'bg-red-50 border-red-200 text-red-600' : myActionMessage.tone === 'climb' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-[#eafbe0] border-[#88e04f]/50 text-[#3f7a1e]'}`}>
                        {myActionMessage.tone === 'danger' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : myActionMessage.tone === 'climb' ? <TrendingUp className="w-5 h-5 shrink-0" /> : <ShieldCheck className="w-5 h-5 shrink-0" />}
                        <span className="text-[13px] font-black leading-tight">{myActionMessage.text}</span>
                    </div>
                )}

                {/* ── RANKING ── */}
                <div className="mt-8 flex flex-col gap-2.5">
                    {loading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[80px] rounded-2xl bg-white/60 border border-black/5 animate-pulse" />)}
                    {!loading && ranking.length === 0 && (
                        <div className="text-center py-16 text-[#1a1a1a]/40 font-bold">Aún no hay puntos esta semana. ¡Completa lecciones para aparecer en la Liga de {leagueName}!</div>
                    )}
                    {!loading && ranking.map((row, i) => {
                        const rank = row.rank;
                        const inPromo = rank <= PROMOTE_COUNT;
                        const inDemote = demotionEnabled && rank >= demoteThreshold;
                        const frameColor = row.equipped_frame || leagueColor;
                        const nameColor = row.equipped_name_color || (row.is_me ? '#632EB0' : '#1a1a1a');
                        const avatarName = firstName(row.full_name);
                        const medal = rank === 1 ? '#eab308' : rank === 2 ? '#a1a1aa' : rank === 3 ? '#d97706' : '#cbd5e1';
                        return (
                            <React.Fragment key={row.user_id}>
                                {rank === 1 && <ZoneLabel color="#5aa531" icon={<ArrowUp className="w-3.5 h-3.5" />} text="Zona de Ascenso" />}
                                {rank === PROMOTE_COUNT + 1 && <ZoneLabel color="#9ca3af" icon={<ShieldCheck className="w-3.5 h-3.5" />} text="Zona Segura" />}
                                {demotionEnabled && rank === demoteThreshold && <ZoneLabel color="#ef4444" icon={<ArrowDown className="w-3.5 h-3.5" />} text="Zona de Riesgo" />}

                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.03 }}
                                    className={`relative flex items-center justify-between p-3.5 rounded-2xl bg-white transition-all ${row.is_me ? 'border-2 border-[#632EB0] shadow-[0_5px_0_#4a2186]' : 'border border-black/10 shadow-[0_4px_0_rgba(0,0,0,0.05)]'}`}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="w-6 text-center font-black text-xl tabular-nums shrink-0" style={{ color: medal }}>{rank}</span>
                                        <div className="w-12 h-12 rounded-xl bg-[#f5f1e4] flex items-center justify-center overflow-hidden shrink-0 shadow-[0_3px_0_rgba(0,0,0,0.12)]" style={{ border: `3px solid ${frameColor}` }}>
                                            <img src={`https://minotar.net/avatar/${encodeURIComponent(avatarName)}/48.png`} alt={avatarName} className="w-full h-full" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-black text-base tracking-tight leading-none truncate" style={{ color: nameColor }}>{row.is_me ? `${avatarName} (Tú)` : avatarName}</span>
                                            {row.equipped_title ? (
                                                <span className="text-[9px] font-black uppercase tracking-widest mt-1 px-2 py-0.5 rounded-full self-start" style={{ color: leagueColor, backgroundColor: `${leagueColor}1A` }}>{row.equipped_title}</span>
                                            ) : row.is_me ? <span className="text-[9px] font-black uppercase tracking-widest text-[#632EB0]/70 mt-1">¡Tu posición!</span> : null}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="flex items-center gap-1.5">
                                            <Zap className="w-4 h-4 text-yellow-500" fill="currentColor" />
                                            <span className="font-black text-lg text-[#1a1a1a] tracking-tight tabular-nums">{row.points.toLocaleString('es-MX')}</span>
                                        </div>
                                        <div className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-full ${row.trend === 'up' ? 'bg-green-50 text-green-500' : row.trend === 'down' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-300'}`}>
                                            {row.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : row.trend === 'down' ? <ArrowDown className="w-4 h-4" /> : <div className="w-3 h-[2px] bg-current rounded-full" />}
                                        </div>
                                    </div>
                                    {!row.is_me && (inPromo || inDemote) && <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-r-full ${inPromo ? 'bg-[#88e04f]' : 'bg-red-300'}`} />}
                                </motion.div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function ZoneLabel({ color, icon, text }: { color: string; icon: React.ReactNode; text: string }) {
    return (
        <div className="py-2 flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: `${color}55` }} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-1.5" style={{ color }}>{icon} {text}</span>
            <div className="h-px flex-1" style={{ backgroundColor: `${color}55` }} />
        </div>
    );
}
