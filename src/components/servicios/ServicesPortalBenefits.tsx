"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export default function ServicesPortalBenefits() {
    const benefits = [
        {
            title: "Material Interactivo",
            description: "Flashcards, quizzes y recursos dinámicos para seguir aprendiendo fuera del servidor.",
            iconSrc: "/images/estrategia-page/book.webp",
            borderColor: "border-[#86d2fb]/40",
            bg: "bg-white/90",
            titleColor: "text-[#2a8ebd]",
        },
        {
            title: "Seguimiento y Reportes",
            description: "Reportes de progreso y logros desbloqueados que los padres pueden revisar en cualquier momento.",
            iconSrc: "/images/service-page/endereye.webp",
            borderColor: "border-[#8ED462]/40",
            bg: "bg-white/90",
            titleColor: "text-[#4caf2e]",
        },
        {
            title: "Repositorio de Gameplay",
            description: "Sesiones grabadas y explicaciones en formato gameplay por si el alumno no puede asistir o quiere repasar.",
            iconSrc: "/images/service-page/enderchest.gif",
            borderColor: "border-[#a855f7]/40",
            bg: "bg-white/90",
            titleColor: "text-[#9333ea]",
        }
    ];

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.15 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.9, y: 30 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.6, type: "spring", bounce: 0.4 },
        },
    };

    return (
        <section className="relative w-full min-h-screen bg-[#1e1e24] rounded-[50px] overflow-hidden flex flex-col items-center justify-center px-6 py-24 md:py-32 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">

            {/* Minecraft-like starry or dark background texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('/images/estrategia-page/pattern-dots.png')] bg-repeat mix-blend-overlay"></div>

            <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                    className="text-center mb-16 md:mb-24"
                >
                    <span className="inline-flex items-center gap-2 bg-white/10 text-[#a855f7] px-6 py-2.5 rounded-sm font-black uppercase tracking-[0.2em] mb-6 shadow-sm border-2 border-white/10 backdrop-blur-md">
                        <img src="/images/service-page/diamond.webp" alt="Diamond" className="w-6 h-6 object-contain" /> Exclusividad
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] max-w-4xl mx-auto drop-shadow-lg">
                        Beneficios del <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] to-[#a855f7] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                            Portal de Alumnos
                        </span>
                    </h2>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto w-full"
                >
                    {benefits.map((benefit, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className={`relative flex flex-col items-center text-center p-8 lg:p-10 rounded-[32px] ${benefit.bg} border-4 ${benefit.borderColor} shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(168,85,247,0.2)] transition-all duration-300 group`}
                        >
                            {/* Inner highlight (glassmorphism effect) */}
                            <div className="absolute inset-0 rounded-[28px] border-2 border-white/50 pointer-events-none" />

                            <div className="relative w-24 h-24 mb-8">
                                {/* Rotating glow effect behind icon */}
                                <div className={`absolute inset-0 bg-gradient-to-br from-white to-transparent rounded-full blur-xl opacity-50 group-hover:scale-125 transition-transform duration-500`}></div>

                                <img
                                    src={benefit.iconSrc}
                                    alt={benefit.title}
                                    className="w-full h-full object-contain relative z-10 drop-shadow-2xl group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement?.classList.add('bg-gray-200', 'rounded-xl');
                                    }}
                                />
                            </div>

                            <h3 className={`text-2xl lg:text-3xl font-black ${benefit.titleColor} mb-4 leading-tight drop-shadow-sm`}>
                                {benefit.title}
                            </h3>
                            <p className="text-gray-600 font-medium leading-relaxed text-lg">
                                {benefit.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
