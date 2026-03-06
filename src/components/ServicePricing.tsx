"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gamepad2, Key, MonitorPlay, Shapes, Star, CheckCircle2 } from "lucide-react";

export default function ServicePricing() {
    const features = [
        { text: "4 sesiones de 1 hora al mes", icon: Star, color: "text-[#f59e0b]", bg: "bg-amber-100" },
        { text: "Acceso al Servidor Privado de Minecraft", icon: Gamepad2, color: "text-[#10b981]", bg: "bg-emerald-100" },
        { text: "Acceso Inmediato al Portal de Alumnos", icon: Key, color: "text-[#a855f7]", bg: "bg-purple-100" },
        { text: "Videos Gameplay Exclusivos", icon: MonitorPlay, color: "text-[#3b82f6]", bg: "bg-blue-100" },
        { text: "Material Interactivo (Flashcards, Quizzes)", icon: Shapes, color: "text-[#ef4444]", bg: "bg-red-100" },
    ];

    return (
        <section className="w-full py-32 bg-[#f5f1e4] relative overflow-hidden flex items-center justify-center px-6">

            {/* Elementos Decorativos de Fondo */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-[#86d2fb]/30 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#8ED462]/20 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-[#f59e0b]/20 rounded-full blur-[50px] pointer-events-none transform -translate-y-1/2" />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                className="w-full max-w-6xl relative z-10"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-white rounded-[40px] md:rounded-[60px] p-8 md:p-16 shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-white">

                    {/* Columna Izquierda: Precio y Título */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 lg:pr-8">
                        <div className="space-y-4">
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="inline-block bg-[#86d2fb]/20 text-[#2a8ebd] px-6 py-2 rounded-full text-base font-bold uppercase tracking-widest"
                            >
                                Plan Exclusivo
                            </motion.span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#222222] tracking-tight leading-[1.1]">
                                Módulo <br className="hidden lg:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ED462] to-[#4caf2e]">Ludora</span>
                            </h2>
                            <p className="text-[#666666] text-lg md:text-xl font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                                Aprende inglés jugando. Descubre todo lo que necesitas para llevar tu nivel al máximo en una experiencia inmersiva.
                            </p>
                        </div>

                        <div className="w-full p-8 rounded-[32px] bg-[#f9fafb] border-2 border-gray-100 flex flex-col items-center lg:items-start">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-[#222222] text-3xl font-bold align-top">$</span>
                                <span className="text-6xl md:text-7xl font-black text-[#222222] tracking-tighter">
                                    999
                                </span>
                                <span className="text-xl text-[#888888] font-bold">
                                    MXN
                                </span>
                            </div>
                            <span className="text-[#888888] font-medium tracking-wide">Facturado mensualmente</span>

                            <button className="w-full mt-8 py-5 bg-[#8ED462] hover:bg-[#7bc052] text-white rounded-[20px] text-xl font-black tracking-wide transition-all duration-300 shadow-[0_8px_25px_0_rgba(142,212,98,0.4)] hover:shadow-[0_12px_35px_rgba(142,212,98,0.3)] hover:-translate-y-1 active:translate-y-1">
                                ¡Inscribirme Ahora!
                            </button>
                        </div>
                    </div>

                    {/* Columna Derecha: Beneficios */}
                    <div className="flex flex-col h-full justify-center">
                        <h3 className="text-2xl font-bold text-[#222222] mb-8 text-center lg:text-left">
                            Todo lo que incluye tu inscripción:
                        </h3>

                        <div className="space-y-4 md:space-y-6">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * i, duration: 0.5, type: "spring" }}
                                    className="flex items-center gap-5 p-4 md:p-5 rounded-2xl md:rounded-[24px] bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow duration-300 group"
                                >
                                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center ${feature.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                        <feature.icon size={26} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-[#333333] font-bold text-lg leading-snug">
                                            {feature.text}
                                        </p>
                                    </div>
                                    <div className="hidden sm:flex flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 items-center justify-center text-gray-300">
                                        <CheckCircle2 size={18} strokeWidth={3} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </motion.div>
        </section>
    );
}
