'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { 
  Headphones, 
  Video, 
  Map, 
  Image as ImageIcon, 
  Gamepad2, 
  Puzzle, 
  CheckSquare, 
  MousePointer2, 
  FileText, 
  BookOpen, 
  PlayCircle,
  Type,
  Mic,
  ChevronLeft
} from 'lucide-react';

import MobileSubHeader from '@/components/dashboard/MobileSubHeader';
import HapticTrigger, { HapticHandle } from '@/components/ui/HapticTrigger';

export default function MaterialesPage() {
    const hapticRef = useRef<HapticHandle>(null);

    // Estructura organizada por "Hubs" de aprendizaje (Todo contenido interno)
    const sections = [
        {
            title: "Pronunciación y Letras",
            icon: Type,
            items: [
                { title: "El Abecedario", icon: Type, href: "/portal-alumno/dashboard/materiales/abc", color: "text-pink-500", bg: "bg-pink-50" },
                { title: "Tabla Fonética", icon: Mic, href: "/portal-alumno/dashboard/materiales/phonetic", color: "text-rose-500", bg: "bg-rose-50" },
                { title: "Guía de Sonidos", icon: Headphones, href: "/portal-alumno/dashboard/materiales/pronunciation", color: "text-indigo-500", bg: "bg-indigo-50" }
            ]
        },
        {
            title: "Listening e Inmersión",
            icon: PlayCircle,
            items: [
                { title: "Dictados Interactivos", icon: Headphones, href: "/portal-alumno/dashboard/materiales/dictados", color: "text-blue-500", bg: "bg-blue-50" },
                { title: "Video Lecciones", icon: Video, href: "/portal-alumno/dashboard/materiales/videos", color: "text-indigo-500", bg: "bg-indigo-50" },
                { title: "Retos de Voz", icon: Mic, href: "/portal-alumno/dashboard/materiales/voice-challenges", color: "text-teal-500", bg: "bg-teal-50" }
            ]
        },
        {
            title: "Gramática Visual",
            icon: ImageIcon,
            items: [
                { title: "Guías Visuales", icon: ImageIcon, href: "/portal-alumno/dashboard/materiales/visual-guides", color: "text-purple-500", bg: "bg-purple-50" },
                { title: "Mapas Mentales", icon: Map, href: "/portal-alumno/dashboard/materiales/mind-maps", color: "text-fuchsia-500", bg: "bg-fuchsia-50" }
            ]
        },
        {
            title: "Práctica y Juegos",
            icon: Gamepad2,
            items: [
                { title: "Crucigramas", icon: Puzzle, href: "/portal-alumno/dashboard/materiales/crosswords", color: "text-orange-500", bg: "bg-orange-50" },
                { title: "Juegos Memoria", icon: Gamepad2, href: "/portal-alumno/dashboard/materiales/memory", color: "text-yellow-500", bg: "bg-yellow-50" },
                { title: "Quizzes Rápidos", icon: CheckSquare, href: "/portal-alumno/dashboard/materiales/quizzes", color: "text-green-500", bg: "bg-green-50" }
            ]
        }
    ];

    const triggerHaptic = () => {
        hapticRef.current?.trigger();
    };

    return (
        <div className="flex flex-col w-full pb-32 bg-white">
            <HapticTrigger ref={hapticRef} />
            <MobileSubHeader />
            
            <div className="flex flex-col gap-12 px-4 pt-8 max-w-7xl mx-auto md:px-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="flex flex-col gap-8">
                        {/* Title Section (Desktop Enhanced) */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-50 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 shadow-sm md:w-14 md:h-14">
                                    <section.icon className="w-6 h-6 text-[#632EB0]" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">
                                        {section.title}
                                    </h2>
                                    <p className="hidden md:block text-sm text-gray-400 font-bold">
                                        {section.items.length} Recursos disponibles
                                    </p>
                                </div>
                            </div>
                            
                            <Link href="#" className="hidden md:flex items-center gap-1 text-[#632EB0] font-black text-xs uppercase tracking-widest hover:underline">
                                Ver todos los recursos
                                <MousePointer2 className="w-3 h-3" />
                            </Link>
                        </div>

                        {/* RESPONSIVE LAYOUTS */}
                        
                        {/* 1. MOBILE LAYOUT: Cubitos (2 Columns) */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:hidden">
                            {section.items.map((item, itemIdx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={itemIdx} className="flex flex-col items-center gap-4">
                                        <Link
                                            href={item.href}
                                            onClick={triggerHaptic}
                                            className="group w-full aspect-square bg-white border-2 border-[#e5e5e5] border-b-[8px] rounded-[2.5rem] flex items-center justify-center relative active:border-b-2 active:translate-y-1.5 transition-all shadow-sm active:bg-[#632EB0] active:border-[#632EB0] overflow-hidden"
                                        >
                                            <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95 group-active:bg-white/20`}>
                                                <Icon className={`w-8 h-8 ${item.color} group-active:text-white transition-colors`} />
                                            </div>
                                            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                                        </Link>
                                        <span className="text-[15px] font-black text-gray-700 text-center leading-tight px-2">
                                            {item.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 2. PC LAYOUT: Modern Gallery Cards (4 Columns) */}
                        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {section.items.map((item, itemIdx) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={itemIdx}
                                        href={item.href}
                                        className="group relative flex flex-col p-6 bg-white border border-gray-100 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_20px_60px_rgba(99,46,176,0.08)] hover:border-[#632EB0]/20 hover:-translate-y-1 overflow-hidden"
                                    >
                                        <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                            <Icon className={`w-6 h-6 ${item.color}`} />
                                        </div>
                                        
                                        <h3 className="text-[17px] font-black text-gray-900 mb-2 leading-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-bold mb-6">
                                            Material interactivo para práctica individual.
                                        </p>
                                        
                                        <div className="mt-auto flex items-center gap-2 text-[#632EB0] text-xs font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                            Explorar
                                            <ChevronLeft className="w-3 h-3 rotate-180" />
                                        </div>

                                        {/* Background accent */}
                                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 ${item.bg}`}></div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Footer Informativo (Desktop Centered) */}
                <div className="mt-20 px-4">
                    <div className="max-w-xl mx-auto p-8 bg-purple-50 rounded-[2.5rem] border border-purple-100 text-center shadow-sm">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <BookOpen className="w-7 h-7 text-[#632EB0]" />
                        </div>
                        <h4 className="text-lg font-black text-purple-900 mb-2">Biblioteca en crecimiento</h4>
                        <p className="text-[14px] text-purple-800 font-bold opacity-70 leading-relaxed">
                            Nuestro equipo académico añade nuevos materiales interactivos todas las semanas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
