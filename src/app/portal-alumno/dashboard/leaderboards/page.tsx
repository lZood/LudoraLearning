"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    Clock,
    Sparkles,
    ArrowUp,
    ArrowDown,
    Users,
    Info,
    Box,
    CheckCircle2,
    TrendingUp,
    ShieldCheck,
    AlertTriangle,
} from "lucide-react";
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import { createClient } from '@/utils/supabase/client';

// ───────────────────────────────────────────────────────────────────────────
// Contrato de datos REALES (migración 0020_ranking_engine):
//   get_leaderboard()   → fila por jugador de la liga del usuario esta semana
//   get_village_chest() → meta cooperativa de la liga (current / target)
// El UI depende de estas columnas EXACTAS.
// ───────────────────────────────────────────────────────────────────────────
type LeaderboardRow = {
    user_id: string;
    full_name: string;
    points: number;
    rank: number;
    trend: string;                 // 'up' | 'down' | 'neutral' | null
    is_me: boolean;
    league_name: string;           // nombre real de la liga (Madera..Netherite)
    league_color: string;          // hex (#8B5E3C ..)
    equipped_frame: string | null; // hex del marco equipado
    equipped_title: string | null; // texto del título equipado
    equipped_name_color: string | null; // hex del color de nombre equipado
};

type VillageChest = {
    current: number;
    target: number;
    reached: boolean;
    league_name: string;
    members: number;
};

// Reglas de ascenso/descenso (coinciden con leagues.promote_count/demote_count por defecto).
const PROMOTE_COUNT = 10; // top que asciende
const DEMOTE_COUNT = 5;   // bottom que desciende
const MIN_ACTIVE_FOR_DEMOTION = 15; // <15 activos → sin descenso

// Madera no desciende nunca (anti-desánimo).
const NO_DEMOTE_LEAGUES = ['Madera'];

// Fallback de color por si la liga no trae hex (no debería ocurrir con datos reales).
const FALLBACK_COLOR = '#632EB0';

// Próximo domingo 23:59:59 local (el ranking semanal cierra el domingo por la noche;
// week_start es lunes según el esquema). Si hoy es domingo, apunta al de hoy.
function nextSundayDeadline(now: Date): Date {
    const d = new Date(now);
    const day = d.getDay(); // 0 = domingo
    const daysUntilSunday = (7 - day) % 7; // 0 si ya es domingo
    d.setDate(d.getDate() + daysUntilSunday);
    d.setHours(23, 59, 59, 999);
    // Si ya pasó el cierre de este domingo, salta al siguiente.
    if (d.getTime() < now.getTime()) d.setDate(d.getDate() + 7);
    return d;
}

function formatCountdown(msLeft: number): string {
    if (msLeft <= 0) return '0d 0h 0m';
    const totalSeconds = Math.floor(msLeft / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
}

// Primer nombre para un ranking entre menores (consistente con get_leaderboard del backend).
function firstName(full: string): string {
    const n = (full ?? '').trim().split(/\s+/)[0];
    return n || 'Aventurero';
}

export default function LeaderboardsPage() {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [ranking, setRanking] = useState<LeaderboardRow[]>([]);
    const [chest, setChest] = useState<VillageChest | null>(null);
    const [now, setNow] = useState<Date>(() => new Date());

    // 1) Carga de datos REALES (marca montado dentro de la tarea async para evitar
    //    un setState síncrono en el cuerpo del efecto; el guard de hidratación vive abajo).
    useEffect(() => {
        let active = true;
        (async () => {
            setMounted(true);
            const supabase = createClient();
            const [lbRes, chestRes] = await Promise.all([
                supabase.rpc('get_leaderboard'),
                supabase.rpc('get_village_chest'),
            ]);
            if (!active) return;

            const rows = (lbRes.data as LeaderboardRow[] | null) ?? [];
            // Defensa: ordena por rank (el backend ya lo hace, pero garantizamos consistencia visual).
            rows.sort((a, b) => a.rank - b.rank);
            setRanking(rows);

            const chestData = (chestRes.data as VillageChest[] | null)?.[0] ?? null;
            setChest(chestData);
            setLoading(false);
        })();
        return () => { active = false; };
    }, []);

    // 2) Countdown real (tick cada segundo).
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const deadline = useMemo(() => nextSundayDeadline(now), [now]);
    const countdown = formatCountdown(deadline.getTime() - now.getTime());

    // Liga del usuario (la primera fila trae el contexto de liga, igual para todos).
    const me = useMemo(() => ranking.find((r) => r.is_me) ?? null, [ranking]);
    const leagueName = me?.league_name ?? ranking[0]?.league_name ?? chest?.league_name ?? 'Madera';
    const leagueColor = me?.league_color ?? ranking[0]?.league_color ?? FALLBACK_COLOR;
    const activeCount = ranking.length;
    const demotionEnabled =
        !NO_DEMOTE_LEAGUES.includes(leagueName) && activeCount >= MIN_ACTIVE_FOR_DEMOTION;
    const demoteThreshold = demotionEnabled ? activeCount - DEMOTE_COUNT + 1 : Infinity; // rank >= esto → riesgo

    // Cofre de la aldea.
    const chestCurrent = chest?.current ?? 0;
    const chestTarget = Math.max(chest?.target ?? 1, 1);
    const chestPct = Math.min(100, Math.round((chestCurrent / chestTarget) * 100));
    const chestReached = chest?.reached ?? chestCurrent >= chestTarget;
    const chestMembers = chest?.members ?? activeCount;

    // Mensajes accionables para "mi" fila (te faltan X XP para subir / para estar seguro).
    const myActionMessage = useMemo(() => {
        if (!me) return null;
        // Para ASCENDER: alcanzar al jugador en el puesto promote_count.
        if (me.rank > PROMOTE_COUNT) {
            const promoCutoffRow = ranking.find((r) => r.rank === PROMOTE_COUNT);
            if (promoCutoffRow) {
                const need = Math.max(0, promoCutoffRow.points - me.points + 1);
                return {
                    tone: 'climb' as const,
                    text: need > 0
                        ? `Te faltan ${need.toLocaleString('es-MX')} XP para entrar a la zona de ascenso.`
                        : '¡Estás a un paso del ascenso!',
                };
            }
        }
        // En RIESGO de descenso: superar al jugador justo por encima de la zona de descenso.
        if (demotionEnabled && me.rank >= demoteThreshold) {
            const safeRow = ranking.find((r) => r.rank === demoteThreshold - 1);
            if (safeRow) {
                const need = Math.max(0, safeRow.points - me.points + 1);
                return {
                    tone: 'danger' as const,
                    text: `Estás en zona de riesgo: gana ${need.toLocaleString('es-MX')} XP para salir del descenso.`,
                };
            }
        }
        // ASCENSO asegurado de momento.
        if (me.rank <= PROMOTE_COUNT) {
            return {
                tone: 'safe' as const,
                text: '¡Estás en zona de ascenso! Mantente arriba para subir de liga.',
            };
        }
        return { tone: 'safe' as const, text: '¡Vas bien! Sigue sumando XP para escalar.' };
    }, [me, ranking, demotionEnabled, demoteThreshold]);

    if (!mounted) return null;

    return (
        <div className="w-full min-h-screen bg-white pb-32">
            <MobileSubHeader hideNav={true} />

            <div className="w-full max-w-full px-0 flex flex-col items-center">

                {/* 1. CABECERA DE LIGA REAL (nombre + color) */}
                <div className="w-full max-w-4xl pt-8 md:pt-10 px-6 text-center space-y-4">
                    {/* Countdown REAL al domingo 23:59 */}
                    <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-gray-50 rounded-full border border-gray-100 shadow-inner">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-[12px] font-black text-gray-500 uppercase tracking-widest tabular-nums">
                            Termina en: {countdown}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] shadow-lg mx-auto"
                            style={{ backgroundColor: `${leagueColor}1A`, border: `3px solid ${leagueColor}` }}
                        >
                            <Sparkles className="w-7 h-7" style={{ color: leagueColor }} fill="currentColor" />
                        </div>
                        <h1
                            className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none"
                            style={{ color: leagueColor }}
                        >
                            Liga de {leagueName}
                        </h1>
                        <p className="text-sm font-bold text-gray-400 max-w-lg mx-auto leading-tight italic">
                            {demotionEnabled
                                ? `Los ${PROMOTE_COUNT} mejores ascienden. Los últimos ${DEMOTE_COUNT} descienden. ¡No bajes la guardia!`
                                : NO_DEMOTE_LEAGUES.includes(leagueName)
                                    ? `Los ${PROMOTE_COUNT} mejores ascienden. En Madera nadie desciende: aquí solo se sube.`
                                    : `Los ${PROMOTE_COUNT} mejores ascienden. Esta semana no hay descenso (faltan competidores).`}
                        </p>
                    </div>
                </div>

                {/* 2. COFRE DE LA ALDEA (meta cooperativa real) */}
                <div className="w-full max-w-2xl px-6 mt-8">
                    <div
                        className={`relative rounded-[2rem] p-5 md:p-6 border-2 shadow-sm overflow-hidden ${
                            chestReached ? 'border-[#88e04f] bg-[#88e04f]/5' : 'border-gray-100 bg-gray-50/60'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-2.5 rounded-2xl ${chestReached ? 'bg-[#88e04f]/20' : 'bg-amber-100'}`}
                                >
                                    {chestReached
                                        ? <CheckCircle2 className="w-5 h-5 text-[#5aa531]" />
                                        : <Box className="w-5 h-5 text-amber-600" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] md:text-sm font-black text-gray-900 uppercase tracking-wide leading-none">
                                        Cofre de la Aldea
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {chestMembers} aldeanos en {leagueName}
                                    </span>
                                </div>
                            </div>
                            {chestReached && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#5aa531] bg-[#88e04f]/20 px-3 py-1.5 rounded-full">
                                    ¡Logrado!
                                </span>
                            )}
                        </div>

                        {/* Barra de progreso current/target */}
                        <div className="w-full h-4 bg-gray-200/70 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${chestPct}%` }}
                                transition={{ duration: 0.9, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{
                                    background: chestReached
                                        ? 'linear-gradient(90deg,#88e04f,#5aa531)'
                                        : 'linear-gradient(90deg,#fbbf24,#f59e0b)',
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[11px] font-black text-gray-700 tabular-nums">
                                {chestCurrent.toLocaleString('es-MX')} / {chestTarget.toLocaleString('es-MX')} XP
                            </span>
                            <span className="text-[11px] font-black text-gray-400 tabular-nums">{chestPct}%</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 leading-tight mt-2">
                            {chestReached
                                ? '¡La aldea cumplió la meta! Todos los que aportaron reciben recompensa al cerrar la semana.'
                                : 'Sumen XP entre todos para abrir el cofre. La recompensa se reparte a quienes aportan.'}
                        </p>
                    </div>
                </div>

                {/* 3. MENSAJE ACCIONABLE DE MI POSICIÓN */}
                {myActionMessage && (
                    <div className="w-full max-w-2xl px-6 mt-4">
                        <div
                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${
                                myActionMessage.tone === 'danger'
                                    ? 'bg-red-50 border-red-100 text-red-600'
                                    : myActionMessage.tone === 'climb'
                                        ? 'bg-amber-50 border-amber-100 text-amber-700'
                                        : 'bg-[#88e04f]/10 border-[#88e04f]/30 text-[#5aa531]'
                            }`}
                        >
                            {myActionMessage.tone === 'danger'
                                ? <AlertTriangle className="w-5 h-5 shrink-0" />
                                : myActionMessage.tone === 'climb'
                                    ? <TrendingUp className="w-5 h-5 shrink-0" />
                                    : <ShieldCheck className="w-5 h-5 shrink-0" />}
                            <span className="text-[12px] md:text-sm font-black leading-tight">
                                {myActionMessage.text}
                            </span>
                        </div>
                    </div>
                )}

                {/* 4. LISTA RANKEADA REAL */}
                <div className="w-full max-w-4xl mt-8 px-6 flex flex-col gap-3 pb-20">
                    {loading && (
                        <div className="flex flex-col gap-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-[88px] rounded-[2.5rem] bg-gray-50 animate-pulse" />
                            ))}
                        </div>
                    )}

                    {!loading && ranking.length === 0 && (
                        <div className="text-center py-16 text-gray-400 font-bold">
                            Aún no hay puntos esta semana. ¡Completa lecciones para aparecer en el ranking de {leagueName}!
                        </div>
                    )}

                    {!loading && ranking.map((row, i) => {
                        const rank = row.rank;
                        const inPromoZone = rank <= PROMOTE_COUNT;
                        const inDemoteZone = demotionEnabled && rank >= demoteThreshold;
                        const frameColor = row.equipped_frame || leagueColor;
                        const nameColor = row.equipped_name_color || (row.is_me ? '#632EB0' : '#111827');
                        const avatarName = firstName(row.full_name);

                        return (
                            <React.Fragment key={row.user_id}>
                                {/* Separador: ZONA DE ASCENSO (arriba del primero) */}
                                {rank === 1 && (
                                    <div className="py-1 flex items-center gap-4">
                                        <div className="h-px bg-[#88e04f]/40 flex-1" />
                                        <span className="text-[10px] font-black text-[#5aa531] uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-1.5">
                                            <ArrowUp className="w-3.5 h-3.5" /> Zona de Ascenso
                                        </span>
                                        <div className="h-px bg-[#88e04f]/40 flex-1" />
                                    </div>
                                )}

                                {/* Separador: ZONA SEGURA (justo después del corte de ascenso) */}
                                {rank === PROMOTE_COUNT + 1 && (
                                    <div className="py-3 flex items-center gap-4">
                                        <div className="h-px bg-gray-200 flex-1" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-1.5">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Zona Segura
                                        </span>
                                        <div className="h-px bg-gray-200 flex-1" />
                                    </div>
                                )}

                                {/* Separador: ZONA DE RIESGO (inicio de la franja de descenso) */}
                                {demotionEnabled && rank === demoteThreshold && (
                                    <div className="py-3 flex items-center gap-4">
                                        <div className="h-px bg-red-100 flex-1" />
                                        <span className="text-[10px] font-black text-red-300 uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-1.5">
                                            <ArrowDown className="w-3.5 h-3.5" /> Zona de Riesgo
                                        </span>
                                        <div className="h-px bg-red-100 flex-1" />
                                    </div>
                                )}

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(i, 12) * 0.04 }}
                                    className={`relative group flex items-center justify-between p-4 md:p-5 rounded-[2.5rem] transition-all ${
                                        row.is_me
                                            ? 'bg-white border-[3px] border-[#632EB0] z-10 scale-[1.02]'
                                            : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md'
                                    }`}
                                    style={row.is_me ? {
                                        boxShadow: '0 20px 40px -16px rgba(99,46,176,0.30), 0 0 0 4px rgba(99,46,176,0.14)',
                                    } : undefined}
                                >
                                    {/* Posición + identidad */}
                                    <div className="flex items-center gap-4 md:gap-7 min-w-0">
                                        <span
                                            className="w-6 md:w-8 text-center font-black text-xl md:text-2xl tracking-tighter shrink-0"
                                            style={{
                                                color:
                                                    rank === 1 ? '#eab308'
                                                        : rank === 2 ? '#a1a1aa'
                                                            : rank === 3 ? '#ea580c'
                                                                : '#d1d5db',
                                            }}
                                        >
                                            {rank}
                                        </span>

                                        <div className="relative shrink-0">
                                            <div
                                                className="w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] bg-gray-50 flex items-center justify-center p-1 overflow-hidden transition-transform group-hover:rotate-3 shadow-inner"
                                                style={{ border: `3px solid ${frameColor}` }}
                                            >
                                                <img
                                                    src={`https://minotar.net/avatar/${encodeURIComponent(avatarName)}/60.png`}
                                                    alt={avatarName}
                                                    className="w-full h-full rounded-2xl"
                                                />
                                            </div>
                                            {row.is_me && (
                                                <div className="absolute -bottom-1 -right-1 bg-[#632EB0] rounded-full p-1 shadow-sm border-2 border-white">
                                                    <Sparkles className="w-2.5 h-2.5 text-white" fill="currentColor" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span
                                                    className="font-black text-base md:text-xl tracking-tight leading-none truncate"
                                                    style={{ color: nameColor }}
                                                >
                                                    {row.is_me ? `${avatarName} (Tú)` : avatarName}
                                                </span>
                                            </div>
                                            {/* Título equipado al lado del nombre */}
                                            {row.equipped_title ? (
                                                <span
                                                    className="text-[9px] font-black uppercase tracking-widest mt-1 px-2 py-0.5 rounded-full self-start"
                                                    style={{
                                                        color: leagueColor,
                                                        backgroundColor: `${leagueColor}1A`,
                                                    }}
                                                >
                                                    {row.equipped_title}
                                                </span>
                                            ) : row.is_me ? (
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#632EB0]/70 mt-1">
                                                    ¡Tu posición!
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* XP semanal + tendencia REAL */}
                                    <div className="flex items-center gap-4 md:gap-8 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-yellow-500" fill="currentColor" />
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-lg md:text-2xl text-gray-900 tracking-tighter leading-none tabular-nums">
                                                    {row.points.toLocaleString('es-MX')}
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                                                    XP esta semana
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            className={`shrink-0 flex items-center justify-center p-1.5 rounded-full ${
                                                row.trend === 'up' ? 'bg-green-50 text-green-500'
                                                    : row.trend === 'down' ? 'bg-red-50 text-red-500'
                                                        : 'bg-gray-50 text-gray-300'
                                            }`}
                                            aria-label={
                                                row.trend === 'up' ? 'Subió' : row.trend === 'down' ? 'Bajó' : 'Sin cambios'
                                            }
                                        >
                                            {row.trend === 'up'
                                                ? <ArrowUp className="w-4 h-4" />
                                                : row.trend === 'down'
                                                    ? <ArrowDown className="w-4 h-4" />
                                                    : <div className="w-4 h-[2px] bg-current rounded-full" />}
                                        </div>
                                    </div>

                                    {/* Borde lateral sutil según zona (refuerzo visual) */}
                                    {!row.is_me && (inPromoZone || inDemoteZone) && (
                                        <span
                                            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full ${
                                                inPromoZone ? 'bg-[#88e04f]' : 'bg-red-300'
                                            }`}
                                        />
                                    )}
                                </motion.div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Tarjeta informativa flotante (solo PC) */}
            <div className="hidden lg:block fixed bottom-10 right-10 w-72 bg-white rounded-[2rem] p-6 shadow-2xl border border-gray-100 z-50">
                <div className="flex items-center gap-3 mb-4">
                    <Info className="w-5 h-5 text-[#632EB0]" />
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Cómo funciona</h3>
                </div>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#88e04f]/10 rounded-xl"><ArrowUp className="w-3.5 h-3.5 text-[#5aa531]" /></div>
                        <p className="text-[11px] font-bold text-gray-500 leading-tight">
                            Quedar entre los primeros {PROMOTE_COUNT} te sube a la siguiente liga mineral.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-50 rounded-xl"><Box className="w-3.5 h-3.5 text-amber-600" /></div>
                        <p className="text-[11px] font-bold text-gray-500 leading-tight">
                            Llenen el Cofre de la Aldea entre todos para repartir recompensas cooperativas.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-50 rounded-xl"><ArrowDown className="w-3.5 h-3.5 text-red-400" /></div>
                        <p className="text-[11px] font-bold text-gray-500 leading-tight">
                            {NO_DEMOTE_LEAGUES.includes(leagueName)
                                ? 'En Madera nadie desciende. ¡Aquí solo se aprende y se sube!'
                                : `Los últimos ${DEMOTE_COUNT} bajan de liga (salvo que falten competidores).`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
