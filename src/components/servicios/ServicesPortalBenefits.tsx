"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

/* ── Illustration 1: Material Interactivo ─────────────── */
const InteractiveIllustration = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        {/* Glow behind pills */}
        <div className="absolute inset-0 bg-[#86d2fb]/10 blur-3xl rounded-full" />

        {/* Pills cluster — stacked with offset + rotation */}
        <div className="relative w-full max-w-[260px] mx-auto">

            {/* Top row */}
            <motion.div
                initial={{ opacity: 0, y: -10, rotate: -4 }}
                whileInView={{ opacity: 1, y: 0, rotate: -4 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, type: "spring", bounce: 0.5 }}
                className="absolute top-0 left-[18%] bg-[#1f2a36] border border-[#ff705d]/40 text-[#ff9f90] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl z-20"
            >
                <span>✍️</span> Quizzes
            </motion.div>

            {/* Second row */}
            <motion.div
                initial={{ opacity: 0, y: -10, rotate: -3 }}
                whileInView={{ opacity: 1, y: 0, rotate: -3 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, type: "spring", bounce: 0.5 }}
                className="absolute top-[28px] left-[2%] bg-[#1f2a36] border border-[#86d2fb]/40 text-[#86d2fb] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl z-30"
            >
                <span>📖</span> Flashcards
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -10, rotate: 5 }}
                whileInView={{ opacity: 1, y: 0, rotate: 5 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, type: "spring", bounce: 0.5 }}
                className="absolute top-[32px] right-[2%] bg-[#1f2a36] border border-[#c084fc]/40 text-[#c084fc] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl z-30"
            >
                <span>🎯</span> Ejercicios
            </motion.div>

            {/* Third row */}
            <motion.div
                initial={{ opacity: 0, y: -10, rotate: -2 }}
                whileInView={{ opacity: 1, y: 0, rotate: -2 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45, type: "spring", bounce: 0.5 }}
                className="absolute top-[64px] left-[10%] bg-[#1f2a36] border border-[#88e04f]/40 text-[#88e04f] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl z-40"
            >
                <span>🎧</span> Audio
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -10, rotate: 3 }}
                whileInView={{ opacity: 1, y: 0, rotate: 3 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55, type: "spring", bounce: 0.5 }}
                className="absolute top-[68px] right-[8%] bg-[#1f2a36] border border-[#fbbf24]/40 text-[#fbbf24] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl z-40"
            >
                <span>📝</span> Tareas
            </motion.div>

            {/* Spacer to give height */}
            <div className="h-[120px]" />
        </div>
    </div>
);

/* ── Illustration 2: Seguimiento ─────────────── */
const TrackingIllustration = () => (
    <div className="relative w-full h-full flex items-end justify-center pb-4">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-gradient-to-t from-[#88e04f]/15 to-transparent rounded-[50%] blur-xl" />

        {/* Top stats pills */}
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="absolute top-2 left-1/2 -translate-x-[110%] bg-[#1f2a36] border border-[#88e04f]/30 text-[#88e04f] px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5"
        >
            Nivel B1
        </motion.div>
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="absolute top-2 left-1/2 translate-x-[10%] bg-[#1f2a36] border border-[#ff705d]/30 text-[#ff9f90] px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5"
        >
            🔥 12 días
        </motion.div>

        {/* Connecting lines SVG */}
        <svg className="absolute top-10 left-1/2 -translate-x-1/2" width="120" height="60" viewBox="0 0 120 60" fill="none">
            <path d="M30 5 Q 30 30, 60 50" stroke="#88e04f" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
            <path d="M90 5 Q 90 30, 60 50" stroke="#ff705d" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
        </svg>

        {/* Center progress circle */}
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, type: "spring", bounce: 0.4 }}
            className="relative z-10"
        >
            <div className="w-20 h-20 rounded-full bg-[#1f2a36] border-2 border-[#88e04f]/40 flex items-center justify-center shadow-[0_0_40px_rgba(136,224,79,0.3)]">
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" stroke="#2a3a48" strokeWidth="4" fill="none" />
                        <circle cx="32" cy="32" r="28" stroke="#88e04f" strokeWidth="4" fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * 0.32}`}
                            strokeLinecap="round" />
                    </svg>
                    <span className="text-white font-black text-sm">68%</span>
                </div>
            </div>
        </motion.div>
    </div>
);

/* ── Illustration 3: Repositorio de Gameplay ─────────────── */
const GameplayIllustration = () => (
    <div className="relative w-full h-full flex items-end justify-center pb-4">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-gradient-to-t from-[#c084fc]/15 to-transparent rounded-[50%] blur-xl" />

        {/* Video thumbnails */}
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="absolute bottom-24 left-1/2 -translate-x-[120%] w-20 h-14 bg-gradient-to-br from-[#c084fc]/30 to-[#632eaf]/30 border border-[#c084fc]/40 rounded-lg flex items-center justify-center -rotate-6"
        >
            <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#632eaf">
                    <polygon points="5,3 19,12 5,21" />
                </svg>
            </div>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="absolute bottom-24 left-1/2 translate-x-[20%] w-20 h-14 bg-gradient-to-br from-[#88e04f]/25 to-[#2d8a1e]/30 border border-[#88e04f]/40 rounded-lg flex items-center justify-center rotate-6"
        >
            <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#2d8a1e">
                    <polygon points="5,3 19,12 5,21" />
                </svg>
            </div>
        </motion.div>

        {/* Center main video */}
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="relative z-10 w-28 h-20 bg-gradient-to-br from-[#1f2a36] to-[#0b1420] border border-[#c084fc]/40 rounded-xl flex items-center justify-center shadow-[0_0_40px_rgba(192,132,252,0.3)]"
        >
            <div className="w-10 h-10 rounded-full bg-[#c084fc] flex items-center justify-center shadow-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <polygon points="5,3 19,12 5,21" />
                </svg>
            </div>
            {/* Live indicator */}
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[7px] text-white font-bold">REC</span>
            </div>
        </motion.div>
    </div>
);

const benefits = [
    {
        title: "Material interactivo con IA integrada",
        description: "Flashcards, quizzes, crucigramas, dictados y juegos de memoria. Nuestra IA evalúa tu pronunciación y escritura al instante para que aprendas más rápido.",
        Illustration: InteractiveIllustration,
    },
    {
        title: "Gamificación que engancha",
        description: "Sube de liga (de Carbón a Netherite), gana XP y Monedas Ludora, desbloquea logros y compite en leaderboards semanales contra otros alumnos.",
        Illustration: TrackingIllustration,
    },
    {
        title: "Clases grabadas y biblioteca completa",
        description: "Videos de gramática, vocabulario, pronunciación y conversación siempre disponibles. Nunca te pierdes una lección, repasa a tu ritmo.",
        Illustration: GameplayIllustration,
    },
];

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, type: "spring", bounce: 0.25 },
    },
};

export default function ServicesPortalBenefits() {
    return (
        <section className="relative w-full bg-[#0b1018] rounded-[50px] overflow-hidden px-6 py-20 md:py-28 min-h-screen flex flex-col justify-center">
            <div className="relative z-10 max-w-7xl mx-auto w-full">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]">
                        3 razones para elegir nuestro{" "}
                        <span className="text-[#c084fc]">Portal de Alumnos</span>
                    </h2>
                </motion.div>

                {/* Cards grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
                >
                    {benefits.map((benefit, i) => {
                        const Illustration = benefit.Illustration;
                        return (
                            <motion.div
                                key={i}
                                variants={cardVariants}
                                className="relative bg-[#131a24] border border-white/5 rounded-[28px] p-8 lg:p-10 flex flex-col hover:border-white/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                            >
                                {/* Text content */}
                                <div className="relative z-10">
                                    <h3 className="text-xl md:text-2xl font-bold text-white leading-tight mb-4">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </div>

                                {/* Illustration */}
                                <div className="relative mt-auto pt-10 h-[200px]">
                                    <Illustration />
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
