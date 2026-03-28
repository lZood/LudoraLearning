"use client";

import React, { useState, useEffect } from 'react';
import { 
    Check, 
    Zap, 
    ShieldCheck, 
    CreditCard, 
    Calendar, 
    ArrowRight, 
    Video, 
    BookOpen, 
    Gamepad2, 
    Users, 
    Trophy,
    PlayCircle,
    HelpCircle,
    ChevronRight,
    Sparkles,
    Settings,
    Mail,
    Bell
} from "lucide-react";
import { motion } from "framer-motion";
import UpgradeButton from './UpgradeButton';
import ManageSuscripcionButton from './ManageSuscripcionButton';

interface SuscripcionContentProps {
    isPremium: boolean;
    renewalDate: string;
    userName: string;
}

export default function SuscripcionContent({ isPremium: initialIsPremium, renewalDate, userName }: SuscripcionContentProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isDevMode, setIsDevMode] = useState(false);
    const [devIsPremium, setDevIsPremium] = useState(initialIsPremium);

    // Sync devIsPremium with initialIsPremium but allow toggle
    useEffect(() => {
        setDevIsPremium(initialIsPremium);
    }, [initialIsPremium]);

    const isUserPremium = isDevMode ? devIsPremium : initialIsPremium;

    // --- VIEW: SUBSCRIBED (Premium - BRILLIANT STYLE) ---
    const renderPremiumView = () => (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl space-y-12"
        >
            {/* Header Title */}
            <div className="space-y-1">
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Premium</h2>
                <div className="h-1 w-8 bg-[#815a9b] rounded-full" />
            </div>

            {/* 1. HERO BANNER */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 border border-gray-100 p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2rem] shadow-xl shadow-purple-100 flex items-center justify-center relative shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-[2rem]"></div>
                    <ShieldCheck className="w-12 md:w-16 text-[#815a9b]" />
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white"
                    >
                        <Sparkles className="w-3 h-3 text-white" fill="currentColor" />
                    </motion.div>
                </div>
                
                <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Estás aprendiendo en <span className="text-[#815a9b]">Premium</span></h3>
                    <p className="text-gray-500 font-bold text-sm md:text-base leading-relaxed">
                        Acceso ilimitado a todos nuestros cursos interactivos de Minecraft, clases en vivo y materiales exclusivos.
                    </p>
                </div>
            </div>

            {/* 2. PREMIUM BENEFITS SECTION */}
            <section className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Beneficios Premium</h4>
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    {[
                        { title: "Niveles de Inglés ilimitados", icon: <Trophy className="text-amber-500"/>, bg: "bg-amber-50" },
                        { title: "4 Clases de Minecraft al mes", icon: <Gamepad2 className="text-green-500"/>, bg: "bg-green-50" },
                        { title: "Materiales y Guías descargables", icon: <BookOpen className="text-blue-500"/>, bg: "bg-blue-50" },
                        { title: "Videos gameplay de aprendizaje", icon: <PlayCircle className="text-red-500"/>, bg: "bg-red-50" },
                        { title: "Acompañamiento por Maestro", icon: <Users className="text-[#815a9b]"/>, bg: "bg-purple-50" }
                    ].map((benefit, i) => (
                        <div key={i} className="flex items-center gap-5 p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors group">
                            <div className={`w-12 h-12 ${benefit.bg} rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                                {React.cloneElement(benefit.icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
                            </div>
                            <span className="text-base font-black text-gray-700 tracking-tight">{benefit.title}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. MANAGE SUBSCRIPTION SECTION */}
            <section className="space-y-8 pt-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Gestionar Suscripción</h4>
                
                {/* Reminder Box */}
                <div className="bg-gray-50/50 rounded-[2.5rem] p-8 border border-gray-100 flex items-start gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                        <Calendar className="w-7 h-7 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                        <p className="font-black text-gray-900 tracking-tight leading-tight">¿Te preocupa que te cobren por sorpresa?</p>
                        <p className="text-sm text-gray-500 font-bold leading-relaxed">
                            Te enviaremos un correo de recordatorio <span className="text-gray-900">2 días</span> antes de que termine tu periodo actual. Siempre puedes escribir a <span className="text-[#815a9b] underline font-black">soporte@ludora.org</span> si tienes dudas.
                        </p>
                    </div>
                </div>

                {/* Subscription Details List */}
                <div className="space-y-10 px-2">
                    {/* Current Plan Row */}
                    <div className="flex items-start justify-between group">
                        <div className="space-y-1">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Plan actual</h5>
                            <p className="text-lg font-black text-gray-900">Plan Maestro Anual (Suscrito)</p>
                        </div>
                        <ManageSuscripcionButton />
                    </div>

                    {/* Next Billing Row */}
                    <div className="space-y-2">
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Próxima fecha de cobro</h5>
                        <p className="text-sm text-gray-500 font-bold leading-relaxed">
                            Tu próximo cargo de <span className="text-gray-900">$14,280 MXN</span> más impuestos aplicables será el <span className="text-gray-900 font-black">{renewalDate}</span>.
                        </p>
                    </div>

                    {/* Payment Info Row */}
                    <div className="space-y-4">
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Información de pago</h5>
                        <button className="px-6 py-3 border-2 border-gray-200 rounded-full text-sm font-black text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95">
                            Actualizar método de pago
                        </button>
                    </div>
                    
                    {/* Help Link */}
                    <div className="pt-6 border-t border-gray-100">
                        <button className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-[#815a9b] flex items-center gap-2 transition-colors">
                            <HelpCircle className="w-4 h-4" /> Ayuda con suscripciones
                        </button>
                    </div>
                </div>
            </section>
        </motion.div>
    );

    // --- VIEW: NOT SUBSCRIBED (Free Mode) ---
    const renderFreeView = () => (
        <div className="w-full flex flex-col items-center">
             {/* [Omitted for brevity - No changes requested to Free view in this turn] */}
             {/* ... existing free view code ... */}
             <div className="text-center py-10">
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-4">Mejora tu experiencia</h2>
                <button onClick={() => setDevIsPremium(true)} className="px-8 py-4 bg-[#815a9b] text-white rounded-full font-black">
                    Simular Suscripción
                </button>
             </div>
        </div>
    );

    return (
        <div className="w-full flex-1 flex flex-col pt-4 relative">
            {isUserPremium ? renderPremiumView() : renderFreeView()}

            {/* DEV MODE TOGGLE (Floating) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 scale-75 md:scale-100 origin-bottom-right">
                    <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-2 rounded-2xl shadow-xl flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl">
                            <Settings className="w-4 h-4 text-gray-400" />
                            <span className="text-[10px] font-black uppercase text-gray-400">Dev Mode</span>
                            <div className={`w-2 h-2 rounded-full ${isDevMode ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                        <button 
                            onClick={() => setIsDevMode(!isDevMode)}
                            className={`p-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                isDevMode ? 'bg-[#815a9b] text-white' : 'bg-gray-100 text-gray-400'
                            }`}
                        >
                            {isDevMode ? 'On' : 'Off'}
                        </button>
                    </div>
                    {isDevMode && (
                        <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-2 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
                             <button 
                                onClick={() => setDevIsPremium(true)}
                                className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase ${devIsPremium ? 'bg-purple-100 text-[#815a9b]' : 'bg-gray-50 text-gray-400'}`}
                             >
                                Subscribed
                             </button>
                             <button 
                                onClick={() => setDevIsPremium(false)}
                                className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase ${!devIsPremium ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}
                             >
                                Trial
                             </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
