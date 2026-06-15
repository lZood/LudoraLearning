"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, 
    Flame, 
    Zap, 
    ChevronUp, 
    ChevronDown, 
    Clock, 
    Check, 
    Lock, 
    ShieldCheck, 
    Sparkles,
    ArrowUp,
    ArrowDown,
    Gem,
    Users,
    Info
} from "lucide-react";
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import { createClient } from '@/utils/supabase/client';

type RankRow = { name: string; xp: number; avatar: string; isUser: boolean; trend: string };

// --- LEAGUE CONFIGURATION --- 
const LEAGUES = [
    { id: 'carbon', name: 'Carbón', color: 'text-gray-500', bg: 'bg-gray-100', icon: '⚫', border: 'border-gray-300' },
    { id: 'hierro', name: 'Hierro', color: 'text-zinc-400', bg: 'bg-zinc-50', icon: '🥈', border: 'border-zinc-300' },
    { id: 'cobre', name: 'Cobre', color: 'text-orange-600', bg: 'bg-orange-50', icon: '🥉', border: 'border-orange-300' },
    { id: 'oro', name: 'Oro', color: 'text-yellow-500', bg: 'bg-yellow-50', icon: '🥇', border: 'border-yellow-300' },
    { id: 'esmeralda', name: 'Esmeralda', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: 'Emerald', border: 'border-emerald-300' },
    { id: 'diamante', name: 'Diamante', color: 'text-cyan-500', bg: 'bg-cyan-50', icon: 'Diamond', border: 'border-cyan-300' },
    { id: 'netherite', name: 'Netherite', color: 'text-purple-700', bg: 'bg-purple-50', icon: 'Netherite', border: 'border-purple-300' },
];

export default function LeaderboardsPage() {
    const [mounted, setMounted] = useState(false);
    const [ranking, setRanking] = useState<RankRow[]>([]);
    const [currentLeague, setCurrentLeague] = useState(LEAGUES[3]); // Default Gold
    const hapticRef = useRef<HapticHandle>(null);
    const leagueRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        (async () => {
            const supabase = createClient();
            const { data } = await supabase.rpc('get_leaderboard');
            setRanking(((data as Array<{ display_name: string; points: number; is_self: boolean }> | null) ?? []).map((r) => ({
                name: r.is_self ? `Tú (${r.display_name})` : r.display_name,
                xp: r.points,
                avatar: r.display_name,
                isUser: r.is_self,
                trend: 'neutral',
            })));
        })();
    }, []);

    // Auto-center active league effect
    useEffect(() => {
        if (mounted && leagueRefs.current[currentLeague.id]) {
            leagueRefs.current[currentLeague.id]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [currentLeague, mounted]);

    const triggerHaptic = () => {
        hapticRef.current?.trigger();
    };

    if (!mounted) return null;

    return (
        <div className="w-full min-h-screen bg-white pb-32">
            <HapticTrigger ref={hapticRef} />
            
            {/* Mobile Header (Always Fixed) */}
            <MobileSubHeader hideNav={true} />

            <div className="w-full max-w-full px-0 flex flex-col items-center">
                
                {/* 1. TOP LEAGUES NAVBAR (Minecraft Order) */}
                <div 
                    ref={scrollContainerRef}
                    className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-[62px] md:top-16 z-30 pt-2 px-4 overflow-x-auto no-scrollbar scroll-smooth"
                >
                    <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 pb-2 min-w-max px-4">
                        {LEAGUES.map((league) => {
                            const isActive = currentLeague.id === league.id;
                            return (
                                <button 
                                    key={league.id}
                                    ref={(el) => { leagueRefs.current[league.id] = el; }}
                                    onClick={() => { setCurrentLeague(league); triggerHaptic(); }}
                                    className={`flex flex-col items-center gap-2 p-3 min-w-[100px] rounded-[2rem] transition-all relative ${
                                        isActive ? `${league.bg} border-2 ${league.border} shadow-sm` : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <span className={`text-xl ${isActive ? 'scale-125' : 'grayscale opacity-50'} transition-transform`}>
                                        {league.id === 'esmeralda' ? '💎' : league.id === 'diamante' ? '💠' : league.id === 'netherite' ? '🟣' : league.icon}
                                    </span>
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? league.color : 'text-gray-300'}`}>
                                        {league.name}
                                    </span>
                                    {isActive && (
                                        <motion.div layoutId="activeLeagueIndicator" className="absolute -bottom-4 w-12 h-1.5 bg-gray-900 rounded-t-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. LEAGUE HEADER INFO */}
                <div className="w-full max-w-4xl pt-10 px-6 text-center space-y-4">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-gray-50 rounded-full border border-gray-100 shadow-inner">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-[12px] font-black text-gray-500 uppercase tracking-widest">Temina en: 2d 14h 55m</span>
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                            Liga de {currentLeague.name}
                        </h1>
                        <p className="text-sm font-bold text-gray-400 max-w-lg mx-auto leading-tight italic">
                            Los 10 mejores pasan a la siguiente liga. Mantente arriba para ganar tu borde de {currentLeague.name}.
                        </p>
                    </div>
                </div>

                {/* 3. VERTICAL RANKING LIST (Duolingo Style - Option B) */}
                <div className="w-full max-w-4xl mt-12 px-6 flex flex-col gap-3 pb-20">
                    {ranking.length === 0 && (
                        <div className="text-center py-16 text-gray-400 font-bold">
                            Aún no hay puntos esta semana. ¡Completa lecciones para aparecer en el ranking! 🏆
                        </div>
                    )}
                    {ranking.map((user, i) => {
                        const rank = i + 1;
                        const isPromoZone = rank <= 10;
                        const isDemoteZone = rank > 30; // Not applicable for 15 mock users
                        const leagueBorderClass = `border-[3px] ${currentLeague.id === 'oro' ? 'border-yellow-400' : currentLeague.id === 'esmeralda' ? 'border-emerald-400' : 'border-gray-200'}`;

                        return (
                            <React.Fragment key={i}>
                                {/* Promotion Line Indicator */}
                                {rank === 11 && (
                                    <div className="py-4 flex items-center gap-4">
                                        <div className="h-px bg-red-100 flex-1"></div>
                                        <span className="text-[10px] font-black text-red-300 uppercase tracking-[0.2em] whitespace-nowrap">Zona de Descenso</span>
                                        <div className="h-px bg-red-100 flex-1"></div>
                                    </div>
                                )}
                                {rank === 1 && (
                                    <div className="py-2 flex items-center gap-4">
                                        <div className="h-px bg-green-100 flex-1"></div>
                                        <span className="text-[10px] font-black text-green-300 uppercase tracking-[0.2em] whitespace-nowrap">Zona de Ascenso</span>
                                        <div className="h-px bg-green-100 flex-1"></div>
                                    </div>
                                )}

                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`relative group flex items-center justify-between p-4 md:p-5 rounded-[2.5rem] transition-all ${
                                        user.isUser 
                                            ? 'bg-white border-[3px] border-[#815a9b] shadow-xl shadow-purple-50 ring-4 ring-purple-100/50 z-10 scale-[1.02]' 
                                            : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md'
                                    }`}
                                >
                                    {/* Position & Identity */}
                                    <div className="flex items-center gap-5 md:gap-8">
                                        <span className={`w-6 md:w-8 text-center font-black text-xl md:text-2xl tracking-tighter ${
                                            rank === 1 ? 'text-yellow-500' : 
                                            rank === 2 ? 'text-zinc-400' : 
                                            rank === 3 ? 'text-orange-600' : 'text-gray-200'
                                        }`}>
                                            {rank}
                                        </span>
                                        
                                        <div className={`relative shrink-0`}>
                                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] bg-gray-50 flex items-center justify-center p-1 overflow-hidden transition-transform group-hover:rotate-3 shadow-inner ${user.isUser ? leagueBorderClass : 'border-2 border-gray-100'}`}>
                                                <img 
                                                    src={`https://minotar.net/avatar/${user.avatar}/60.png`} 
                                                    alt={user.name}
                                                    className="w-full h-full rounded-2xl"
                                                />
                                            </div>
                                            {user.isUser && (
                                                <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-sm border-2 border-white">
                                                    <Sparkles className="w-2.5 h-2.5 text-white" fill="currentColor" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col">
                                            <span className={`font-black text-base md:text-xl tracking-tight leading-none ${user.isUser ? 'text-[#815a9b]' : 'text-gray-900'}`}>
                                                {user.name}
                                            </span>
                                            {user.isUser && (
                                                <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 mt-1">¡Tú posición!</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats & Trend */}
                                    <div className="flex items-center gap-6 md:gap-10">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-yellow-500" fill="currentColor" />
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-xl md:text-2xl text-gray-900 tracking-tighter leading-none">{user.xp.toLocaleString()}</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Total XP</span>
                                            </div>
                                        </div>
                                        
                                        <div className={`shrink-0 flex items-center justify-center p-1.5 rounded-full ${
                                            user.trend === 'up' ? 'bg-green-50 text-green-500' : 
                                            user.trend === 'down' ? 'bg-red-50 text-red-500' : 
                                            'bg-gray-50 text-gray-300'
                                        }`}>
                                            {user.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : user.trend === 'down' ? <ArrowDown className="w-4 h-4" /> : <div className="w-4 h-[2px] bg-current rounded-full" />}
                                        </div>
                                    </div>
                                </motion.div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Info Floating Card (PC Only) */}
            <div className="hidden lg:block fixed bottom-10 right-10 w-72 bg-white rounded-[2rem] p-6 shadow-2xl border border-gray-100 z-50">
                <div className="flex items-center gap-3 mb-4">
                    <Info className="w-5 h-5 text-[#815a9b]" />
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Sobre las Ligas</h3>
                </div>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-50 rounded-xl"><ArrowUp className="w-3.5 h-3.5 text-green-500" /></div>
                        <p className="text-[11px] font-bold text-gray-500 leading-tight">Quedar entre los primeros 10 te permite subir a la siguiente liga mineral.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#815a9b]/10 rounded-xl"><Gem className="w-3.5 h-3.5 text-[#815a9b]" /></div>
                        <p className="text-[11px] font-bold text-gray-500 leading-tight">Obtén el borde de perfil de tu liga actual para presumir tus logros en Discord y la comunidad.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
