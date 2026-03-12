"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Trophy, Lightbulb, MessageSquare } from "lucide-react";
import { WigglyUnderline } from "@/components/WigglyUnderline";

const events = [
    {
        id: "lunes",
        day: "Lunes",
        date: "Próximo Lunes",
        title: "Torneo de Spelling",
        description: "Mapa de aventuras. Deletrea correctamente para avanzar y gana diamantes.",
        type: "Competencia",
        icon: <Trophy className="w-6 h-6 text-[#f9d314]" />,
        bgColor: "bg-[#f5f1e4]",
        pillColor: "bg-[#f9d314]/20 text-[#222]",
    },
    {
        id: "miercoles",
        day: "Miércoles",
        date: "Próximo Miércoles",
        title: "Escape Room",
        description: "Resuelve acertijos en inglés con tu equipo para escapar del Nether.",
        type: "Cooperativo",
        icon: <Users className="w-6 h-6 text-[#ef4444]" />,
        bgColor: "bg-white",
        pillColor: "bg-[#ef4444]/10 text-[#ef4444]",
    },
    {
        id: "viernes",
        day: "Viernes",
        date: "Próximo Viernes",
        title: "Construcción Épica",
        description: "Tema: Biomas del Mundo. Construye y describe tu creación paso a paso.",
        type: "Creativo",
        icon: <Lightbulb className="w-6 h-6 text-[#10b981]" />,
        bgColor: "bg-white",
        pillColor: "bg-[#10b981]/10 text-[#10b981]",
    },
    {
        id: "sabado",
        day: "Sábado",
        date: "Próximo Sábado",
        title: "Debate Master",
        description: "Alumnos avanzados discuten sobre la mitología de Minecraft. Full English.",
        type: "Avanzado",
        icon: <MessageSquare className="w-6 h-6 text-[#a855f7]" />,
        bgColor: "bg-white",
        pillColor: "bg-[#a855f7]/10 text-[#a855f7]",
    },
];

export default function EventsCalendar() {
    return (
        <section className="relative w-full py-24 md:py-32 bg-[#f5f1e4] rounded-t-[50px] overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <div className="relative z-10 max-w-[90vw] xl:max-w-[85vw] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white shadow-sm border border-gray-100 mb-6">
                        <Calendar className="w-5 h-5 text-[#8ED462]" />
                        <span className="text-[#222222] font-bold tracking-wide uppercase text-sm">Próximas Misiones</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#222222] tracking-tight leading-[1.05] mb-6">
                        Una comunidad siempre <br className="hidden md:block" />
                        <span className="text-[#8ED462]">
                            activa
                        </span>
                    </h2>
                    <p className="text-[#555555] text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        Inscríbete hoy y únete a los eventos de esta semana. Siempre hay algo nuevo que construir, explorar y debatir.
                    </p>
                </motion.div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                            className={`group p-8 rounded-[32px] ${event.bgColor} shadow-[0_15px_40px_rgba(0,0,0,0.04)] border-2 border-transparent hover:border-white transition-all overflow-hidden relative cursor-default bg-white flex flex-col`}
                        >
                            {/* Accent line at top */}
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-[#8ED462] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-[#222222] text-2xl font-black">{event.day}</h3>
                                    <p className="text-[#888888] font-bold text-sm tracking-wide">{event.date}</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    {event.icon}
                                </div>
                            </div>

                            <h4 className="text-xl font-bold text-[#222222] mb-3 leading-tight">{event.title}</h4>
                            <p className="text-[#555555] font-medium leading-relaxed mb-8 flex-1">
                                {event.description}
                            </p>

                            <div className="mt-auto">
                                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase ${event.pillColor}`}>
                                    {event.type}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
