'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  History,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import CursosSubNav from '@/components/dashboard/CursosSubNav';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';

// Mock Data for Phase 1
const MOCK_CLASSES = [
    { 
        id: 1, 
        title: "Aventura en Survival", 
        teacher: "Teacher Sam", 
        date: "Hoy, 25 Mar", 
        time: "17:00 - 18:00", 
        slots: 3, 
        level: "Banda 1",
        status: "available"
    },
    { 
        id: 2, 
        title: "Construcción Creativa", 
        teacher: "Teacher Alex", 
        date: "Mañana, 26 Mar", 
        time: "16:30 - 17:30", 
        slots: 0, 
        level: "Banda 1 & 2",
        status: "full"
    },
    { 
        id: 3, 
        title: "Redstone Masterclass", 
        teacher: "Teacher Dani", 
        date: "Viernes, 27 Mar", 
        time: "18:00 - 19:00", 
        slots: 8, 
        level: "Banda 2",
        status: "available"
    },
    { 
        id: 4, 
        title: "Exploración de Biomas", 
        teacher: "Teacher Sam", 
        date: "Sábado, 28 Mar", 
        time: "11:00 - 12:00", 
        slots: 5, 
        level: "Banda 1",
        status: "available"
    }
];

export default function CalendarioPage() {
    const [coins, setCoins] = useState(2);
    const [monthlyClasses, setMonthlyClasses] = useState(1); // 1 out of 4 used
    const hapticRef = useRef<HapticHandle>(null);

    const triggerHaptic = () => {
        hapticRef.current?.trigger();
    };

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#F8F9FB] pb-40">
            <HapticTrigger ref={hapticRef} />
            <MobileSubHeader hideNav={true} />
            
            <div className="flex flex-col gap-6 px-4 pt-6 max-w-7xl mx-auto w-full">
                
                {/* 1. WALLET CARD (Premium Hero) */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#632EB0] to-[#4E248B] rounded-[2.5rem] p-6 shadow-xl shadow-purple-200">
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-purple-200 text-xs font-black uppercase tracking-widest">Tus Monedas Ludora</span>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-black text-white">{coins}</span>
                                <div className="w-10 h-10 relative">
                                    <Image 
                                        src="/moneda_ludora_3d_icon_1774482917879.png" 
                                        alt="Moneda" 
                                        fill
                                        className="object-contain animate-bounce-slow"
                                    />
                                </div>
                            </div>
                            <p className="text-purple-200/70 text-[11px] font-bold mt-2">
                                Gana más monedas completando unidades en tu curso.
                            </p>
                        </div>
                        
                        <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/20">
                            <span className="text-[10px] text-white/60 font-black uppercase ">Clases este mes</span>
                            <span className="text-2xl font-black text-white">{monthlyClasses}/4</span>
                            <div className="h-1.5 w-16 bg-white/20 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-green-400 rounded-full" style={{ width: `${(monthlyClasses/4)*100}%` }}></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Background decorations */}
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 -top-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>
                </div>

                {/* 2. SECTION TITLE */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-gray-900 leading-tight">Clases Disponibles</h2>
                        <span className="text-xs text-gray-400 font-bold tracking-wide">Basado en tu Nivel y Unidades</span>
                    </div>
                    <button className="p-2 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
                        <History className="w-5 h-5" />
                    </button>
                </div>

                {/* 3. CLASS LIST */}
                <div className="flex flex-col gap-4">
                    {MOCK_CLASSES.map((clase) => (
                        <motion.div 
                            key={clase.id}
                            whileTap={{ scale: 0.98 }}
                            className={`relative bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm transition-all ${clase.status === 'full' ? 'opacity-70' : 'hover:shadow-md'}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                                        clase.status === 'full' ? 'bg-gray-50 border-gray-100' : 'bg-purple-50 border-purple-100'
                                    }`}>
                                        <Users className={`w-6 h-6 ${clase.status === 'full' ? 'text-gray-300' : 'text-[#632EB0]'}`} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-black text-gray-900 text-[17px] leading-tight mb-1">{clase.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-400">{clase.teacher}</span>
                                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                            <span className="text-[10px] font-black tracking-widest text-[#632EB0] uppercase">{clase.level}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    clase.slots === 0 ? 'bg-gray-100 text-gray-400' : 'bg-green-50 text-green-600'
                                }`}>
                                    {clase.slots === 0 ? 'Lleno' : `${clase.slots} Cupos`}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="flex items-center gap-2 bg-gray-50/50 rounded-2xl p-2.5 px-4 border border-gray-50">
                                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                                    <span className="text-[13px] font-bold text-gray-700">{clase.date}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50/50 rounded-2xl p-2.5 px-4 border border-gray-50">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-[13px] font-bold text-gray-700">{clase.time}</span>
                                </div>
                            </div>

                            <button 
                                disabled={clase.status === 'full' || coins < 1 || monthlyClasses >= 4}
                                onClick={() => {
                                    triggerHaptic();
                                    // Reservar lógica futura
                                }}
                                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                                    clase.status === 'full' 
                                        ? 'bg-gray-100 text-gray-300 shadow-none cursor-not-allowed' 
                                        : 'bg-white border-2 border-[#632EB0] text-[#632EB0] hover:bg-purple-50 active:scale-95 shadow-purple-50'
                                }`}
                            >
                                {clase.status === 'full' ? 'Sin Cupos' : 'Agendar con 1 Moneda'}
                                {clase.status !== 'full' && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* 4. HELP BOX */}
                <div className="bg-blue-50/50 border border-blue-100/50 rounded-[2rem] p-6 mt-4 mb-8">
                   <div className="flex gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                            <Info className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-black text-blue-900">¿Cómo funcionan las clases?</h4>
                            <p className="text-xs text-blue-800 font-medium leading-relaxed opacity-70">
                                Las clases son grupales (máx. 8 alumnos) y se realizan en nuestro servidor privado de Minecraft. Necesitas 1 Moneda Ludora por cada reserva. Puedes agendar hasta 4 clases al mes.
                            </p>
                        </div>
                   </div>
                </div>

            </div>

            <CursosSubNav />

            {/* Floating Info (Monedas Insuficientes) - Solo ejemplo UI */}
            <AnimatePresence>
                {coins === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-32 left-4 right-4 z-[200] bg-orange-500 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3"
                    >
                        <AlertCircle className="w-6 h-6 shrink-0" />
                        <div className="flex flex-col">
                            <p className="text-[13px] font-black">Te has quedado sin monedas</p>
                            <p className="text-[11px] font-bold opacity-80">Completa la siguiente unidad del curso para ganar otra.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
