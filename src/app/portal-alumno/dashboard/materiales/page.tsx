"use client";

import React from 'react';
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
    Calendar,
    MessageSquare,
    Mic,
    BookOpen,
    PlayCircle
} from 'lucide-react';

export default function MaterialesPage() {

    // Estructura simplificada para un diseño más limpio y visual
    const sections = [
        {
            title: "Listening & Video",
            icon: PlayCircle,
            items: [
                { title: "Dictados", icon: Headphones, href: "#", color: "text-blue-500", bg: "bg-blue-50" },
                { title: "Videos Interactivos", icon: Video, href: "#", color: "text-indigo-500", bg: "bg-indigo-50" },
                { title: "Retos de Voz", icon: Mic, href: "#", color: "text-teal-500", bg: "bg-teal-50" }
            ]
        },
        {
            title: "Gramática Visual",
            icon: ImageIcon,
            items: [
                { title: "Guías Visuales", icon: ImageIcon, href: "#", color: "text-purple-500", bg: "bg-purple-50" },
                { title: "Mapas Mentales", icon: Map, href: "#", color: "text-fuchsia-500", bg: "bg-fuchsia-50" },
                { title: "Phonemic Chart", icon: MessageSquare, href: "#", color: "text-pink-500", bg: "bg-pink-50" }
            ]
        },
        {
            title: "Juegos y Retos",
            icon: Gamepad2,
            items: [
                { title: "Crucigramas", icon: Puzzle, href: "#", color: "text-orange-500", bg: "bg-orange-50" },
                { title: "Juegos Memoria", icon: Gamepad2, href: "#", color: "text-yellow-500", bg: "bg-yellow-50" },
                { title: "Quizzes", icon: CheckSquare, href: "#", color: "text-green-500", bg: "bg-green-50" },
                { title: "Arrastrar", icon: MousePointer2, href: "#", color: "text-emerald-500", bg: "bg-emerald-50" }
            ]
        },
        {
            title: "Descargables",
            icon: FileText,
            items: [
                { title: "Cheat Sheets", icon: BookOpen, href: "#", color: "text-rose-500", bg: "bg-rose-50" },
                { title: "Planners", icon: Calendar, href: "#", color: "text-red-500", bg: "bg-red-50" }
            ]
        }
    ];

    return (
        <div className="flex flex-col gap-10 pb-20 w-full max-w-5xl mx-auto animate-in fade-in duration-500">

            {/* Header Amigable */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-[2rem] p-8 md:p-10 border-2 border-gray-100 shadow-sm gap-6">
                <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Materiales Educativos</h1>
                    <p className="text-gray-500 text-lg">
                        Explora herramientas interactivas, juegos, guías visuales y más. Todo lo que necesitas para dominar el inglés.
                    </p>
                </div>
                <div className="w-24 h-24 bg-[#632EB0]/10 rounded-3xl flex items-center justify-center shrink-0 rotate-3">
                    <BookOpen className="w-12 h-12 text-[#632EB0]" />
                </div>
            </div>

            {/* Secciones de Materiales */}
            <div className="flex flex-col gap-12">
                {sections.map((section, idx) => (
                    <div key={idx} className="flex flex-col gap-5">

                        {/* Título de Sección */}
                        <div className="flex items-center gap-3 px-2">
                            <div className="p-2 bg-gray-100 rounded-xl">
                                <section.icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                        </div>

                        {/* Grid de Tarjetas (Estilo App) */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {section.items.map((item, itemIdx) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={itemIdx}
                                        href={item.href}
                                        className="group bg-white rounded-3xl p-6 border-2 border-gray-100 hover:border-[#632EB0] hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-center gap-4 hover:-translate-y-1 cursor-pointer"
                                    >
                                        <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className={`w-8 h-8 ${item.color}`} />
                                        </div>
                                        <span className="font-bold text-gray-800 group-hover:text-[#632EB0] transition-colors leading-tight">
                                            {item.title}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
