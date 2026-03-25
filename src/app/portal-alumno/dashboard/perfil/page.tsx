import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { 
    User, 
    Mail, 
    Calendar, 
    ShieldCheck, 
    Edit3, 
    Flame, 
    Zap, 
    Trophy, 
    Medal,
    Settings,
    Bell,
    Lock,
    LogOut,
    ChevronRight,
    Map,
    Sparkles
} from "lucide-react";
import Link from 'next/link';

export default async function PerfilPage() {
    const supabase = await createClient();

    // 1. Validate Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/portal-alumno');

    // 2. Fetch User Data from DB
    const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    // 3. Subscription Status
    const { data: subsData } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .maybeSingle();

    const isPremium = !!subsData;
    const joinedYear = new Date(userData?.created_at || user.created_at).getFullYear();
    const joinedMonth = new Date(userData?.created_at || user.created_at).toLocaleDateString('es-MX', { month: 'long' });

    return (
        <div className="flex flex-col gap-10 pb-20 w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
            
            {/* 1. Header Banner & Identity */}
            <div className="relative mt-8">
                {/* Banner Background */}
                <div className="h-48 md:h-64 rounded-[2.5rem] bg-gradient-to-r from-[#815a9b] to-[#5e4171] border-4 border-white shadow-xl relative overflow-hidden group">
                     {/* Decorative pattern overlays */}
                     <div className="absolute inset-0 opacity-20 transition-transform duration-700 group-hover:scale-110 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                     <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                </div>

                {/* Profile Float Info */}
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 px-10 -mt-16 relative z-10 text-center md:text-left">
                    {/* Avatar with Ring */}
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl bg-white p-1.5 shadow-2xl border-4 border-white transform transition-transform group-hover:scale-105 duration-500 overflow-hidden">
                            <div className="w-full h-full bg-[#f8f5fa] rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                                <img
                                    src={`https://minotar.net/armor/bust/${userData?.full_name?.split(' ')[0] || 'Steve'}/150.png`}
                                    alt="Minecraft Avatar"
                                    className="w-full h-full drop-shadow-xl z-20"
                                />
                                {/* Glow reflection */}
                                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent"></div>
                            </div>
                        </div>
                        {isPremium && (
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-2.5 rounded-2xl shadow-lg border-4 border-white animate-bounce-slow">
                                <ShieldCheck className="w-6 h-6 text-[#5e4171]" strokeWidth={3} />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 pb-4 flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
                                {userData?.full_name || user.email?.split('@')[0]}
                            </h1>
                            {isPremium && (
                                <span className="px-4 py-1.5 rounded-full bg-purple-50 text-[#815a9b] text-[10px] font-black uppercase tracking-widest border border-purple-100 shadow-sm align-middle">
                                    Aventurero Maestro
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-gray-400 font-bold text-sm justify-center md:justify-start">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Maestro desde {joinedMonth} {joinedYear}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pb-4">
                        <button className="bg-white border-2 border-gray-100 p-3.5 rounded-2xl shadow-sm hover:border-[#815a9b] hover:text-[#815a9b] transition-all hover:-translate-y-1 active:scale-95 text-gray-500">
                            <Edit3 className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
                
                {/* LEFT: Stats & Progression */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Racha", val: "7", sub: "Días", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
                            { label: "Total XP", val: "2,450", sub: "Puntos", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50" },
                            { label: "Escalafón", val: "Plata", sub: "III", icon: Trophy, color: "text-blue-500", bg: "bg-blue-50" },
                            { label: "Logros", val: "12", sub: "Medallas", icon: Medal, color: "text-purple-500", bg: "bg-purple-50" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center gap-3 group hover:-translate-y-1 transition-all hover:shadow-md cursor-pointer">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                                    <stat.icon className="w-6 h-6" fill={i < 2 ? "currentColor" : "none"} />
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-gray-900 leading-none mb-1">{stat.val}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* banda Progress Section */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                            <div className="flex flex-col gap-2 flex-1 text-center md:text-left">
                                <p className="text-xs font-black uppercase tracking-widest text-[#815a9b]">Dominio del Lenguaje</p>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Tu Banda actual: {userData?.english_level || 'A1'}</h3>
                                <p className="text-gray-500 font-medium">Estás a solo <span className="font-bold text-gray-900">450 XP</span> de alcanzar el siguiente nivel de certificación.</p>
                                
                                <div className="mt-8">
                                    <div className="w-full h-4 bg-gray-50 rounded-full border border-gray-100 overflow-hidden p-1 shadow-inner">
                                        <div 
                                            className="h-full bg-gradient-to-r from-[#815a9b] to-indigo-400 rounded-full shadow-lg relative"
                                            style={{ width: '65%' }}
                                        >
                                            <div className="absolute top-0 right-0 w-2 h-full bg-white/30 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{userData?.english_level || 'A1'}</span>
                                        <span className="text-xs font-black text-[#815a9b]">65% Completado</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nivel Proxima Banda</span>
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0 flex items-center justify-center p-6 bg-purple-50 rounded-full w-32 h-32 border-4 border-white shadow-lg animate-pulse">
                               <Map className="w-12 h-12 text-[#815a9b]" />
                            </div>
                        </div>
                        {/* Decorative background overlay */}
                        <div className="absolute bottom-0 right-0 opacity-[0.03] grayscale pointer-events-none group-hover:scale-105 transition-transform duration-1000">
                             <img src="/icons/logo-dark.png" alt="" className="w-48 h-48 translate-x-12 translate-y-12" />
                        </div>
                    </div>

                    {/* Recent Badges Section */}
                    <div className="bg-[#fcfaff] rounded-[2.5rem] p-10 border-2 border-purple-100/50 shadow-inner">
                        <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-purple-400 fill-purple-400" />
                            Logros Recientes
                        </h3>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="flex flex-col items-center gap-3 group cursor-help">
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border-2 border-gray-50 flex items-center justify-center transition-all group-hover:bg-purple-600 group-hover:border-purple-600">
                                        <Trophy className="w-8 h-8 text-yellow-500 group-hover:text-white" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center leading-none">Cazador I</p>
                                </div>
                            ))}
                            {[4, 5, 6].map((n) => (
                                <div key={n} className="flex flex-col items-center gap-3 opacity-30 grayscale filter">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                                        <Lock className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center leading-none">???</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Quick Settings & Menu */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col h-full">
                        <h3 className="text-xl font-black text-gray-900 mb-8 px-2">Configuración rápida</h3>
                        
                        <div className="flex flex-col gap-2 flex-1">
                            {[
                                { label: "Seguridad y Password", sub: "Gestiona tu acceso", icon: ShieldCheck },
                                { label: "Notificaciones", sub: "Controla tus alertas", icon: Bell },
                                { label: "Preferencias de Banda", sub: "Ajusta tu nivel inicial", icon: Trophy },
                                { label: "Suscripción Maestro", sub: "Gestiona tu pago en Stripe", icon: ShieldCheck, link: "/portal-alumno/dashboard/suscripcion" },
                                { label: "Configuración Avanzada", sub: "Privacidad y más", icon: Settings },
                            ].map((item, i) => (
                                <Link 
                                    key={i}
                                    href={item.link || '#'}
                                    className="flex items-center justify-between p-4 rounded-3xl hover:bg-gray-50 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm shadow-gray-100 group-hover:bg-white group-hover:border-purple-200 transition-colors">
                                           <item.icon className="w-5 h-5 text-gray-400 group-hover:text-[#815a9b]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-800">{item.label}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.sub}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-50">
                            <button className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-500 rounded-3xl font-black text-sm hover:bg-red-100 transition-all group">
                                <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                Cerrar Sesión Segura
                            </button>
                        </div>
                    </div>

                    {/* Help/Feedback Widget */}
                    <div className="bg-[#815a9b] rounded-[2rem] p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-black text-lg mb-2">Comentarios</h4>
                            <p className="text-purple-100 text-xs font-medium leading-relaxed mb-6">¿Tienes alguna idea para mejorar Ludora? Tu feedback como pionero es vital para nosotros.</p>
                            <button className="bg-white/10 hover:bg-white/20 border border-white/20 p-3 rounded-2xl w-full text-xs font-black uppercase tracking-widest transition-all">
                                Enviar Sugerencia
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
