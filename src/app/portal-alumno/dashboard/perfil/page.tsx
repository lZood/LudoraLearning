"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
    Flame, 
    Zap, 
    Trophy, 
    ShieldCheck, 
    Settings, 
    ChevronRight, 
    Sparkles, 
    Clock, 
    CreditCard, 
    User,
    Gamepad2,
    BookOpen,
    PlayCircle,
    Users,
    ArrowUp,
    LogOut
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import SuscripcionContent from '@/components/dashboard/SuscripcionContent';
import { createClient } from '@/utils/supabase/client';

type TabType = 'cuenta' | 'suscripcion' | 'preferencias';
type RankRow = { name: string; avatar: string; xp: number; rank: number; isUser: boolean };

export default function PerfilPage() {
    const supabase = createClient();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // Cierra la sesión y vuelve al login.
    const handleLogout = async () => {
        setLoggingOut(true);
        try { await supabase.auth.signOut(); } catch { /* aún así navegamos al login */ }
        router.replace('/portal-alumno');
        router.refresh();
    };
    const [activeTab, setActiveTab] = useState<TabType>('cuenta');
    const hapticRef = useRef<HapticHandle>(null);
    const [userData, setUserData] = useState({ name: 'Cargando…', isPremium: false, renewalDate: 'Cargando...' });
    const [stats, setStats] = useState({ streak: 0, xp: 0, coins: 0, level: '—' });
    const [ranking, setRanking] = useState<RankRow[]>([]);

    // Respeta el ?tab= con el que enlaza el layout (p. ej. "Mi suscripción" -> ?tab=suscripcion).
    useEffect(() => {
        try {
            const t = new URLSearchParams(window.location.search).get('tab');
            if (t === 'cuenta' || t === 'suscripcion' || t === 'preferencias') setActiveTab(t);
        } catch { /* noop */ }
    }, []);

    useEffect(() => {
        setMounted(true);
        let active = true;
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!active) return;
            if (!user) { setUserData((d) => ({ ...d, name: 'Estudiante' })); return; }
            // Las 4 consultas en paralelo (antes en serie -> waterfall).
            const [profileR, subR, gR, lbR] = await Promise.all([
                supabase.from('users').select('full_name, english_level').eq('id', user.id).maybeSingle(),
                supabase.from('subscriptions').select('status, current_period_end').eq('user_id', user.id).in('status', ['active', 'trialing']).maybeSingle(),
                supabase.from('user_gamification').select('xp_total, level_number, coins, current_streak').eq('user_id', user.id).maybeSingle(),
                supabase.rpc('get_leaderboard'),
            ]);
            if (!active) return;
            const profile = profileR.data, sub = subR.data, g = gR.data, lb = lbR.data;
            setUserData({
                name: profile?.full_name || 'Estudiante',
                isPremium: !!sub,
                renewalDate: sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'Proximamente',
            });
            setStats({
                streak: g?.current_streak ?? 0,
                xp: g?.xp_total ?? 0,
                coins: g?.coins ?? 0,
                level: profile?.english_level || `Nv ${g?.level_number ?? 1}`,
            });
            setRanking(((lb as Array<{ display_name: string; points: number; rank: number; is_self: boolean }> | null) ?? [])
                .slice(0, 5)
                .map((r) => ({
                    name: r.is_self ? `Tú (${r.display_name})` : r.display_name,
                    avatar: r.display_name,
                    xp: r.points,
                    rank: r.rank,
                    isUser: r.is_self,
                })));
        };
        fetchData();
        return () => { active = false; };
    }, []);

    if (!mounted) return null;

    const navItems = [
        { name: "Cuenta", id: 'cuenta' as TabType, icon: User },
        { name: "Suscripcion", id: 'suscripcion' as TabType, icon: CreditCard },
        { name: "Preferencias", id: 'preferencias' as TabType, icon: Settings },
    ];

    return (
        <div className="w-full min-h-screen bg-white">
            <HapticTrigger ref={hapticRef} />
            <div className="md:hidden"><MobileSubHeader hideNav={true} /></div>

            {/* Layout Wrapper CENTERED */}
            <div className="max-w-[1400px] mx-auto w-full flex flex-col md:flex-row gap-8 lg:gap-20 pt-4 md:pt-14 px-4 md:px-12">
                
                {/* --- SIDEBAR --- */}
                <aside className="hidden md:flex flex-col gap-4 w-72 shrink-0 sticky top-32 h-fit">
                    <div className="bg-gray-50/50 p-4 rounded-[2.5rem] border border-gray-100 flex flex-col gap-3 shadow-sm">
                        {navItems.map((item) => (
                            <button 
                                key={item.id} 
                                onClick={() => { setActiveTab(item.id); hapticRef.current?.trigger(); }}
                                className={`flex items-center gap-4 p-4 rounded-[1.8rem] transition-all duration-300 ${activeTab === item.id ? 'bg-gray-200/80 shadow-inner' : 'hover:bg-gray-100/50'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === item.id ? 'bg-gray-300' : 'bg-gray-200/50'}`}><item.icon className="w-5 h-5" /></div>
                                <span className={`text-[15px] font-black ${activeTab === item.id ? 'text-gray-900' : 'text-gray-500'}`}>{item.name}</span>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="bg-gray-50/50 p-4 rounded-[2.5rem] border border-gray-100 flex items-center gap-4 hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
                    >
                        <div className="w-10 h-10 rounded-full bg-red-100/70 flex items-center justify-center"><LogOut className="w-5 h-5 text-red-500" /></div>
                        <span className="text-[15px] font-black text-red-500">{loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</span>
                    </button>
                </aside>

                {/* --- CONTENT CENTERED IN FLEX --- */}
                <div className="flex-1 flex justify-center pb-32">
                    <div className="w-full max-w-3xl">
                        <AnimatePresence mode="wait">
                            {activeTab === 'cuenta' && (
                                <motion.div key="cuenta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                    {/* IDENTITY */}
                                    <div className="flex flex-col items-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-purple-200/40 rounded-full blur-3xl opacity-50 scale-150"></div>
                                            <div className="w-44 h-44 md:w-56 md:h-56 rounded-[4rem] bg-white p-2 shadow-2xl border-4 border-white relative z-10 overflow-hidden">
                                                <div className="w-full h-full bg-gradient-to-b from-gray-50 to-white rounded-[3.5rem] flex items-center justify-center p-6"><img src={`https://minotar.net/armor/bust/Steve/300.png`} className="w-full h-full drop-shadow-2xl" /></div>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 z-20"><div className="bg-yellow-400 p-2.5 rounded-2xl border-4 border-white"><ShieldCheck className="w-6 h-6 text-[#5e4171]" /></div></div>
                                        </div>
                                        <div className="mt-8 text-center space-y-1">
                                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">{userData.name}</h1>
                                            <span className="px-5 py-1.5 rounded-full bg-purple-100/60 text-[#815a9b] text-[11px] font-black uppercase tracking-widest">Aventurero Maestro</span>
                                        </div>
                                    </div>

                                    {/* STATS */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[{ label: "Racha", val: String(stats.streak), icon: Flame, color: "text-orange-500" }, { label: "XP", val: stats.xp.toLocaleString(), icon: Zap, color: "text-yellow-500" }, { label: "Nivel", val: stats.level, icon: Trophy, color: "text-[#815a9b]" }, { label: "Monedas", val: String(stats.coins), icon: Sparkles, color: "text-yellow-600" }].map((s, i) => (
                                            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center gap-2">
                                                <s.icon className={`w-6 h-6 ${s.color}`} />
                                                <span className="text-2xl font-black text-gray-900 tracking-tighter">{s.val}</span>
                                                <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest">{s.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* REPORTE PARA PADRES */}
                                    <a href="/portal-alumno/dashboard/reporte" className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-gradient-to-br from-[#88e04f] to-[#5bbf2e] rounded-3xl flex items-center justify-center shadow-lg"><Trophy className="w-8 h-8 text-white" /></div>
                                            <div>
                                                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Para tutores</span>
                                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Reporte de progreso</h3>
                                                <p className="text-[11px] text-gray-400 font-bold mt-1">Resumen imprimible del avance del alumno</p>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-green-50 transition-all"><ChevronRight className="w-5 h-5 text-gray-300" /></div>
                                    </a>

                                    {/* SUB CARD */}
                                    <div onClick={() => setActiveTab('suscripcion')} className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-gradient-to-br from-[#815a9b] to-[#5e4171] rounded-3xl flex items-center justify-center shadow-lg"><ShieldCheck className="w-8 h-8 text-white" /></div>
                                            <div>
                                                <span className="text-[10px] font-black text-[#815a9b] uppercase tracking-widest">Suscripción Activa</span>
                                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Plan Aventurero</h3>
                                                <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold mt-1"><Clock className="w-3.5 h-3.5" /><span>Renueva el {userData.renewalDate}</span></div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-purple-50 transition-all"><ChevronRight className="w-5 h-5 text-gray-300" /></div>
                                    </div>

                                    {/* RANKING */}
                                    <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Rankin Semanal</h3>
                                            <div className="px-4 py-2 bg-gray-50 rounded-full font-black text-[11px] text-gray-400">2d 14h</div>
                                        </div>
                                        <div className="space-y-2">
                                            {ranking.length === 0 && (
                                                <p className="text-center text-gray-400 font-bold py-6 text-sm">Aún no hay puntos esta semana. ¡Completa lecciones para subir! 🏆</p>
                                            )}
                                            {ranking.map((u) => (
                                                <div key={u.rank} className={`flex items-center justify-between p-4 rounded-[2rem] ${u.isUser ? 'bg-purple-50/40 border-2 border-purple-100' : ''}`}>
                                                    <div className="flex items-center gap-5">
                                                        <span className="w-4 text-center font-black text-gray-300">{u.rank}</span>
                                                        <img src={`https://minotar.net/avatar/${u.avatar}/60.png`} className="w-11 h-11 rounded-xl bg-gray-100 p-1" />
                                                        <span className={`font-black tracking-tight ${u.isUser ? 'text-[#815a9b]' : 'text-gray-900'}`}>{u.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4"><Zap className="w-4 h-4 text-yellow-500" fill="currentColor" /><span className="font-black text-gray-900">{u.xp.toLocaleString()}</span></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* CERRAR SESIÓN (visible también en móvil) */}
                                    <button
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="w-full flex items-center justify-center gap-3 py-4 rounded-[2rem] bg-red-50 text-red-600 font-black hover:bg-red-100 transition-all disabled:opacity-50"
                                    >
                                        <LogOut className="w-5 h-5" /> {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
                                    </button>
                                </motion.div>
                            )}
                            {activeTab === 'suscripcion' && (
                                <motion.div key="suscripcion" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <SuscripcionContent isPremium={userData.isPremium} renewalDate={userData.renewalDate} userName={userData.name} />
                                </motion.div>
                            )}
                            {activeTab === 'preferencias' && (
                                <motion.div key="prefs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-4">Preferencias</h3>
                                    <p className="text-gray-400 font-bold mb-8">Configura tu experiencia en Ludora.</p>
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center"><Settings className="w-10 h-10 text-gray-300" /></div>
                                    <button
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-red-50 text-red-600 font-black hover:bg-red-100 transition-all disabled:opacity-50"
                                    >
                                        <LogOut className="w-5 h-5" /> {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
