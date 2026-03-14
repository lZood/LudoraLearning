"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Gamepad2, Key, MonitorPlay, Shapes, Star, CheckCircle2 } from "lucide-react";

export default function ServicePricing() {
    const features = [
        { text: "8 sesiones de 1 hora al mes", iconSrc: "/images/service-page/diamond.webp", color: "text-[#f59e0b]", bg: "bg-amber-50" },
        { text: "Acceso al Servidor Privado de Minecraft", iconSrc: "/images/estrategia-page/grassblock.webp", color: "text-[#10b981]", bg: "bg-emerald-50" },
        { text: "Acceso Inmediato al Portal de Alumnos", iconSrc: "/images/service-page/netherportal.gif", color: "text-[#a855f7]", bg: "bg-purple-70" },
        { text: "Videos Gameplay Exclusivos", iconSrc: "/images/service-page/enderchest.gif", color: "text-[#3b82f6]", bg: "bg-blue-50" },
        { text: "Material Interactivo (Flashcards, Quizzes)", iconSrc: "/images/estrategia-page/bookshelf.webp", color: "text-[#ef4444]", bg: "bg-red-50" },
    ];

    return (
        <section className="w-full min-h-screen py-32 bg-white rounded-[50px] relative overflow-hidden flex items-center justify-center px-6">

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
                                className="inline-flex items-center gap-2 bg-[#632EB0]/10 text-[#632EB0] px-6 py-2 rounded-full text-base font-bold uppercase tracking-widest border border-[#632EB0]/20"
                            >
                                <img src="/images/service-page/diamond.webp" alt="Diamond" className="w-5 h-5" /> Plan Exclusivo
                            </motion.span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#222222] tracking-tight leading-[1.1]">
                                Módulo <br className="hidden lg:block" />
                                <span className="text-[#632EB0]">Ludora Learning</span>
                            </h2>
                            <p className="text-[#666666] text-lg md:text-xl font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                                Únete a la comunidad de aprendizaje más divertida. Todo lo que necesitas en una <strong className="text-[#632EB0]">experiencia premium</strong> dentro de Minecraft.
                            </p>
                        </div>

                        <div className="w-full p-8 rounded-[32px] bg-[#fdfaf5] border-2 border-gray-100 flex flex-col items-center lg:items-start shadow-inner">
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

                            <Link
                                href="/portal-alumno/registro"
                                className="w-full mt-8 py-5 bg-[#8ED462] hover:bg-[#7bc052] text-white rounded-[15px] text-xl font-black tracking-wide transition-all duration-300 shadow-[0_8px_0_0_#598a3b] hover:shadow-[0_6px_0_0_#4a7331] active:shadow-none active:translate-y-[4px] flex items-center justify-center"
                            >
                                <span>¡INSCRÍBETE AHORA!</span>
                            </Link>
                        </div>
                    </div>

                    {/* Columna Derecha: Beneficios */}
                    <div className="flex flex-col h-full justify-center">
                        <h3 className="text-2xl font-black text-[#222222] mb-8 text-center lg:text-left flex items-center justify-center lg:justify-start gap-3">
                            <img src="/images/service-page/logoludoraredondo.webp" className="w-10 h-10" alt="" />
                            ¿Qué incluye tu aventura?
                        </h3>

                        <div className="space-y-4 md:space-y-6">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * i, duration: 0.5, type: "spring" }}
                                    className="flex items-center gap-5 p-4 md:p-5 rounded-2xl md:rounded-[24px] bg-white border-2 border-gray-50 shadow-sm hover:border-[#632EB0]/20 hover:shadow-md transition-all duration-300 group"
                                >
                                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                                        <img src={feature.iconSrc} alt="" className="w-9 h-9 object-contain drop-shadow-sm" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-[#333333] font-bold text-lg leading-snug">
                                            {feature.text}
                                        </p>
                                    </div>
                                    <div className="hidden sm:flex flex-shrink-0 w-10 h-10 items-center justify-center">
                                        <img src="/images/service-page/greenparticle.webp" className="w-full h-full object-contain opacity-0 group-hover:opacity-100 transition-opacity" alt="" />
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
