'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
    Flame, 
    Zap, 
    Trophy, 
    Medal,
    ShieldCheck,
    Settings,
    LogOut,
    ChevronRight,
    Sparkles,
    Calendar,
    ArrowUp,
    Lock,
    Clock,
    UserCircle,
    Bell
} from "lucide-react";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';
import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import Image from 'next/image';

// --- MOCK DATA FOR THE REDESIGN ---
const WEEKLY_LEADERBOARD = [
    { id: '1', name: 'Zoe Ludora', avatar: 'Zoe', xp: 2850, rank: 1, trend: 'up' },
    { id: '2', name: 'Alex Craft', avatar: 'Alex', xp: 2450, rank: 2, trend: 'up' },
    { id: 'me', name: 'Tú (José Carlos)', avatar: 'Steve', xp: 2120, rank: 3, isUser: true, trend: 'neutral' },
    { id: '4', name: 'Santi Bloom', avatar: 'Santi', xp: 1980, rank: 4, trend: 'down' },
    { id: '5', name: 'Emma Rose', avatar: 'Emma', xp: 1850, rank: 5, trend: 'neutral' },
];

const ACHIEVEMENTS = [
    { id: 1, name: 'Cazador I', icon: Trophy, unlocked: true },
    { id: 2, name: 'Racha 7', icon: Flame, unlocked: true },
    { id: 3, name: 'Lector Pro', icon: Medal, unlocked: true },
    { id: 4, name: 'Explorador', icon: Lock, unlocked: false },
    { id: 5, name: 'Maestro', icon: Lock, unlocked: false },
    { id: 6, name: 'Legendario', icon: Lock, unlocked: false },
];

export default function PerfilPage() {
    const [mounted, setMounted] = useState(false);
    const hapticRef = useRef<HapticHandle>(null);
    const [userXP, setUserXP] = useState(2120);

    useEffect(() => {
        setMounted(true);
    }, []);

    const triggerHaptic = () => {
        hapticRef.current?.trigger();
    };

    if (!mounted) return null;

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#F8F9FB] pb-32">
            <HapticTrigger ref={hapticRef} />
            <MobileSubHeader hideNav={true} />

            <div className="flex flex-col gap-8 px-4 pt-6 max-w-2xl mx-auto w-full">
                
                {/* 1. IDENTITY & AVATAR (Interactive Hero) */}
                <div className="relative flex flex-col items-center">
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-200/40 rounded-full blur-[80px]"></div>
                    
                    {/* Minecraft Avatar Container */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-10"
                    >
                        <div className="w-40 h-40 md:w-48 md:h-48 rounded-[3rem] bg-white p-2 shadow-2xl shadow-purple-200/50 border-4 border-white overflow-hidden relative group cursor-pointer" onClick={triggerHaptic}>
                            <div className="w-full h-full bg-gradient-to-b from-purple-50 to-white rounded-[2.5rem] flex items-center justify-center p-6 relative">
                                <img
                                    src={`https://minotar.net/armor/bust/Steve/300.png`}
                                    alt="Minecraft Avatar"
                                    className="w-full h-full drop-shadow-[0_20px_20px_rgba(0,0,0,0.2)] z-20 group-hover:scale-110 transition-transform duration-500"
                                />
                                {/* Reflection Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10"></div>
                            </div>
                        </div>
                        
                        {/* Premium Badge Overlay */}
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-3 rounded-2xl shadow-lg border-4 border-white animate-bounce-slow">
                            <ShieldCheck className="w-6 h-6 text-[#5e4171]" strokeWidth={3} />
                        </div>
                    </motion.div>

                    <div className="mt-6 text-center z-10">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">José Carlos</h1>
                        <span className="px-4 py-1 rounded-full bg-purple-100 text-[#632EB0] text-[10px] font-black uppercase tracking-widest border border-purple-200">
                             Aventurero Maestro
                        </span>
                    </div>
                </div>

                {/* 2. STATS GRID (RPG STYLE) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Racha", val: "7", sub: "Días", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
                        { label: "Total XP", val: "2,450", sub: "Puntos", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50" },
                        { label: "Nivel", val: "A2", sub: "Básico II", icon: Trophy, color: "text-[#632EB0]", bg: "bg-purple-50" },
                        { label: "Monedas", val: "2", sub: "Ludoras", icon: Sparkles, color: "text-yellow-600", bg: "bg-yellow-50" }
                    ].map((stat, i) => (
                        <motion.div 
                            key={i} 
                            whileTap={{ scale: 0.95 }}
                            onClick={triggerHaptic}
                            className={`bg-white p-5 rounded-[2.2rem] border border-gray-100 shadow-sm flex flex-col items-center gap-2 group transition-all cursor-pointer`}
                        >
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" fill={i === 0 ? "currentColor" : "none"} />
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-black text-gray-900 leading-none mb-1">{stat.val}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 3. SUBSCRIPTION CARD (Actionable Widget) */}
                <Link href="/portal-alumno/dashboard/suscripcion" onClick={triggerHaptic}>
                    <div className="bg-white rounded-[2.5rem] p-6 border border-purple-100 shadow-xl shadow-purple-50/50 flex items-center justify-between group overflow-hidden relative">
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#632EB0] to-[#815a9b] rounded-3xl flex items-center justify-center shadow-lg shadow-purple-200">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-[#632EB0] uppercase tracking-widest leading-none mb-1.5">Suscripción Activa</span>
                                <h3 className="text-[17px] font-black text-gray-900">Plan Aventurero</h3>
                                <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-xs font-bold">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Renueva el 25 Abr</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-2xl group-hover:bg-[#632EB0] group-hover:text-white transition-all relative z-10">
                            <ChevronRight className="w-5 h-5 text-[#632EB0] group-hover:text-white transition-colors" />
                        </div>
                        
                        {/* Background flare */}
                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-50 rounded-full blur-2xl group-hover:bg-purple-100 transition-colors"></div>
                    </div>
                </Link>

                {/* 4. WEEKLY RANKING (Vista 1 - Duolingo Style) */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-black text-gray-900 leading-tight">Rankin Semanal</h3>
                            <span className="text-xs text-[#632EB0] font-black uppercase tracking-widest">Liga de Plata</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-[11px] font-black text-gray-500">2d 14h</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {WEEKLY_LEADERBOARD.map((user) => (
                            <div 
                                key={user.id}
                                className={`flex items-center justify-between p-3.5 rounded-3xl transition-all ${
                                    user.isUser 
                                        ? 'bg-purple-50 border-2 border-purple-200 ring-4 ring-purple-100/50' 
                                        : 'bg-white border border-gray-50'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`w-6 text-center font-black text-sm ${
                                        user.rank === 1 ? 'text-yellow-500' : 
                                        user.rank === 2 ? 'text-gray-400' : 
                                        user.rank === 3 ? 'text-amber-600' : 'text-gray-300'
                                    }`}>
                                        {user.rank}
                                    </span>
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 p-1">
                                        <img 
                                            src={`https://minotar.net/avatar/${user.avatar}/40.png`} 
                                            alt={user.name}
                                            className="w-full h-full rounded-lg"
                                        />
                                    </div>
                                    <span className={`font-black text-sm ${user.isUser ? 'text-[#632EB0]' : 'text-gray-800'}`}>
                                        {user.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <Zap className="w-4 h-4 text-yellow-500" fill="currentColor" />
                                        <span className="font-black text-sm text-gray-900">{user.xp.toLocaleString()}</span>
                                    </div>
                                    {user.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button className="w-full mt-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">
                         Ver liga completa
                    </button>
                </div>

                {/* 5. ACHIEVEMENTS (RPG BADGES) */}
                <div className="bg-[#FCFAFF] rounded-[2.5rem] p-8 border-2 border-purple-100 shadow-inner">
                    <div className="flex items-center gap-3 mb-8">
                        <Sparkles className="w-6 h-6 text-purple-400 fill-purple-400" />
                        <h3 className="text-xl font-black text-gray-900">Logros Recientes</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6">
                        {ACHIEVEMENTS.map((item) => (
                            <div key={item.id} className={`flex flex-col items-center gap-3 group transition-opacity ${!item.unlocked && 'opacity-30'}`}>
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all border-b-4 ${
                                    item.unlocked 
                                        ? 'bg-white border-purple-200 shadow-sm group-hover:scale-105' 
                                        : 'bg-gray-100 border-gray-200'
                                }`}>
                                    <item.icon className={`w-10 h-10 ${item.unlocked ? 'text-yellow-500' : 'text-gray-300'}`} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center leading-none">
                                    {item.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. SETTINGS & ACTIONS */}
                <div className="flex flex-col gap-3 mt-4 mb-20">
                     <Link href="#" onClick={triggerHaptic} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[2rem] group hover:border-purple-200 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                <Settings className="w-6 h-6 text-gray-400 group-hover:text-[#632EB0]" />
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-black text-gray-800 text-sm">Configuración</h4>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cuenta y Privacidad</span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#632EB0]" />
                     </Link>

                     <button onClick={triggerHaptic} className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 text-red-500 rounded-[2rem] font-black text-sm hover:bg-red-100 transition-all group">
                        <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        Cerrar Sesión Segura
                    </button>
                </div>

            </div>
        </div>
    );
}
