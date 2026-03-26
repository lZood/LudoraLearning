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
    Bell,
    Camera,
    History,
    Users
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
    const [minecraftUser, setMinecraftUser] = useState('Steve');

    useEffect(() => {
        setMounted(true);
    }, []);

    const triggerHaptic = () => {
        hapticRef.current?.trigger();
    };

    if (!mounted) return null;

    return (
        <div className="flex flex-col w-full min-h-screen bg-white pb-32">
            <HapticTrigger ref={hapticRef} />
            <MobileSubHeader hideNav={true} />
            
            <main className="w-full max-w-[1600px] mx-auto">
                {/* 1. PROFILE HEADER (Premium RPG Banner) */}
                <div className="relative w-full h-80 md:h-[450px] overflow-hidden">
                    {/* Banner Background with dynamic grid */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#632EB0] to-[#4E248B]">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                        {/* Animated flares */}
                        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-[120px] animate-pulse"></div>
                        <div className="absolute top-10 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-[100px] animate-pulse-slow"></div>
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 pt-12">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative group cursor-pointer"
                            onClick={triggerHaptic}
                        >
                            <div className="w-36 h-36 md:w-52 md:h-52 rounded-[3.5rem] bg-white p-3 shadow-2xl rotate-3 transition-transform group-hover:rotate-0 overflow-hidden relative">
                                <div className="w-full h-full bg-gradient-to-b from-purple-50 to-white rounded-[2.8rem] flex items-center justify-center p-4">
                                    <img 
                                        src={`https://api.mineatar.io/body/full/${minecraftUser}?scale=8`}
                                        alt="Avatar"
                                        className="w-full h-full object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)]"
                                    />
                                </div>
                            </div>
                            <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg text-[#5e4171] hover:scale-110 transition-transform">
                                <Camera className="w-6 h-6" />
                            </button>
                        </motion.div>

                        <div className="mt-8 text-center">
                            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg mb-2">José Carlos</h1>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-6 py-2 rounded-full border border-white/20 shadow-lg">
                                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Nivel 14 • Diamante</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. MAIN CONTENT AREA */}
                <div className="px-5 md:px-10 -mt-12 relative z-20 pb-20">
                    
                    {/* STATS ROW (PC Center, Mobile Grid) */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10">
                        {[
                            { label: "Racha", val: "12", sub: "Días", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
                            { label: "Total XP", val: "4.8k", sub: "Puntos", icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
                            { label: "Liga", val: "#4", sub: "Plata", icon: Trophy, color: "text-purple-600", bg: "bg-purple-50" },
                            { label: "Monedas", val: "2", sub: "Ludoras", icon: Sparkles, color: "text-yellow-600", bg: "bg-yellow-50" }
                        ].map((stat, i) => (
                            <motion.div 
                                key={i}
                                whileTap={{ scale: 0.95 }}
                                className="bg-[#F8F9FB] rounded-[2.5rem] p-6 px-10 border border-gray-100 shadow-sm flex flex-col items-center text-center min-w-[140px] md:min-w-[180px]"
                            >
                                <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color} mb-3 shadow-inner`}>
                                    <stat.icon className="w-8 h-8" fill={i === 0 ? "currentColor" : "none"} />
                                </div>
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</span>
                                <span className="text-2xl font-black text-gray-900">{stat.val}</span>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        
                        {/* LEFT COLUMN: Community & Progression */}
                        <div className="lg:col-span-8 flex flex-col gap-10">
                            
                            {/* RANKING CARD (Minecraft Social) */}
                            <div className="bg-[#F8F9FB] rounded-[3.5rem] p-10 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
                                            <Users className="w-8 h-8 text-[#632EB0]" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ranking Semanal</h2>
                                            <span className="text-xs font-black text-[#632EB0] uppercase tracking-widest">Liga de Diamante</span>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-50">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs font-black text-gray-500">Termina en 2d 14h</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {WEEKLY_LEADERBOARD.map((user) => (
                                        <div 
                                            key={user.id}
                                            className={`flex items-center gap-6 p-5 rounded-[2rem] transition-all border-2 ${
                                                user.isUser 
                                                    ? 'bg-purple-100/30 border-[#632EB0]/20 shadow-lg shadow-purple-100/50' 
                                                    : 'bg-white border-transparent hover:border-gray-100'
                                            }`}
                                        >
                                            <span className={`w-8 text-center font-black text-xl ${
                                                user.rank === 1 ? 'text-yellow-500' :
                                                user.rank === 2 ? 'text-gray-400' :
                                                user.rank === 3 ? 'text-orange-400' : 'text-gray-300'
                                            }`}>
                                                {user.rank}
                                            </span>
                                            <div className="w-14 h-14 rounded-2xl bg-[#F8F9FB] p-1 relative overflow-hidden group">
                                                <img 
                                                    src={`https://api.mineatar.io/face/${user.avatar}/60`} 
                                                    alt={user.name}
                                                    className="w-full h-full object-contain relative z-10 transition-transform group-hover:scale-110"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-black text-lg ${user.isUser ? 'text-[#632EB0]' : 'text-gray-900'}`}>{user.name}</p>
                                                {user.isUser && <span className="text-[10px] font-black text-purple-400 uppercase tracking-tighter">¡Ese eres tú!</span>}
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-5 h-5 text-yellow-500" fill="currentColor" />
                                                    <span className="text-lg font-black text-gray-900">{user.xp.toLocaleString()}</span>
                                                </div>
                                                {user.trend === 'up' && <span className="text-[10px] font-black text-green-500 uppercase flex items-center gap-1">Subiendo <ArrowUp className="w-3 h-3" /></span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button className="w-full mt-10 py-5 bg-white border-2 border-gray-100 hover:border-[#632EB0] hover:text-[#632EB0] text-gray-400 font-black text-xs uppercase tracking-widest rounded-3xl transition-all shadow-sm">
                                    Ver toda la clasificación comercial
                                </button>
                            </div>

                            {/* ACHIEVEMENTS (RPG BADGES) */}
                            <div className="bg-[#F8F9FB] rounded-[3.5rem] p-10 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md">
                                        <Medal className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Tus Logros</h2>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {ACHIEVEMENTS.map((item) => (
                                        <div key={item.id} className={`flex flex-col items-center gap-3 group transition-all ${!item.unlocked ? 'opacity-40 grayscale' : 'hover:-translate-y-2'}`}>
                                            <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center transition-all bg-white shadow-sm border-b-8 ${
                                                item.unlocked ? 'border-[#632EB0]/20' : 'border-gray-200'
                                            }`}>
                                                <item.icon className={`w-12 h-12 ${item.unlocked ? 'text-[#632EB0]' : 'text-gray-300'}`} />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-wider text-gray-500 text-center">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Settings & Subs */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            
                            {/* PREMIUM CARD */}
                            <div className="relative overflow-hidden bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl">
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="px-5 py-2 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-yellow-400/20">
                                            Membresía Activa
                                        </div>
                                        <Settings className="w-6 h-6 text-gray-600 hover:text-white transition-colors cursor-pointer" />
                                    </div>
                                    <h3 className="text-3xl font-black mb-3">Ludora Explorer</h3>
                                    <p className="text-gray-400 font-medium mb-10 leading-relaxed">Disfruta de beneficios exclusivos y acceso total a clases de Minecraft.</p>
                                    
                                    <button className="w-full py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-[2rem] hover:scale-105 transition-transform shadow-2xl">
                                        Gestionar Suscripción
                                    </button>
                                </div>
                                {/* Animated background elements for Premium Card */}
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]"></div>
                                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px]"></div>
                            </div>

                            {/* QUICK SETTINGS */}
                            <div className="bg-[#F8F9FB] rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Configuración</h3>
                                <div className="flex flex-col gap-4">
                                    {[
                                        { label: "Notificaciones", icon: Bell, color: "text-blue-500", bg: "bg-blue-50" },
                                        { label: "Historial de Clases", icon: History, color: "text-green-500", bg: "bg-green-50" },
                                        { label: "Seguridad", icon: Lock, color: "text-red-500", bg: "bg-red-50" },
                                        { label: "Panel de Tutor", icon: UserCircle, color: "text-[#632EB0]", bg: "bg-purple-50" }
                                    ].map((opt, i) => (
                                        <button 
                                            key={i}
                                            onClick={triggerHaptic}
                                            className="flex items-center justify-between p-5 bg-white rounded-3xl border border-transparent hover:border-gray-100 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 ${opt.bg} ${opt.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner`}>
                                                    <opt.icon className="w-6 h-6" />
                                                </div>
                                                <span className="font-black text-gray-800 text-[15px]">{opt.label}</span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#632EB0] group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    onClick={triggerHaptic}
                                    className="w-full mt-8 flex items-center justify-center gap-3 p-5 bg-red-100/50 text-red-600 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all border border-red-200/50"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Cerrar Sesión
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
