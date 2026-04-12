"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
    Flame,
    Star,
    Trophy,
    Shield,
    Zap,
    Target,
    Award,
    TrendingUp,
} from "lucide-react";

const bandas = [
    {
        name: "Iniciación Inmersiva",
        levels: "Pre-A1 — A1",
        color: "#88e04f",
        icon: <Shield className="w-5 h-5" />,
        progress: 100,
    },
    {
        name: "Básico Funcional",
        levels: "A1-alto — A2",
        color: "#2ba0ff",
        icon: <Zap className="w-5 h-5" />,
        progress: 65,
    },
    {
        name: "Aventurero Independiente",
        levels: "A2-alto — B1",
        color: "#9b51e0",
        icon: <Award className="w-5 h-5" />,
        progress: 0,
    },
];

const achievements = [
    { name: "Primera palabra", icon: <Star className="w-5 h-5" />, color: "#f5e211", unlocked: true },
    { name: "Racha de 7 días", icon: <Flame className="w-5 h-5" />, color: "#ff705d", unlocked: true },
    { name: "Nivel completo", icon: <Trophy className="w-5 h-5" />, color: "#2ba0ff", unlocked: true },
    { name: "100 XP", icon: <Zap className="w-5 h-5" />, color: "#88e04f", unlocked: true },
    { name: "Maestro del chat", icon: <Target className="w-5 h-5" />, color: "#9b51e0", unlocked: false },
    { name: "Banda completa", icon: <Award className="w-5 h-5" />, color: "#ff705d", unlocked: false },
];

export default function GamificationShowcase() {
    const headerRef = useRef<HTMLDivElement>(null);
    const headerInView = useInView(headerRef, { once: true, margin: "-10% 0px" });
    const contentRef = useRef<HTMLDivElement>(null);
    const contentInView = useInView(contentRef, { once: true, margin: "-10% 0px" });

    return (
        <section className="relative w-full bg-[#1a1a2e] rounded-t-[50px] rounded-b-[50px] py-24 md:py-32 overflow-hidden">
            <div className="max-w-[85vw] mx-auto">
                {/* Header */}
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
                        Sube de nivel{" "}
                        <span className="text-[#f5e211]">de verdad</span>
                    </h2>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed">
                        Rachas, XP, logros y bandas de progresión que hacen que
                        aprender inglés se sienta como una aventura.
                    </p>
                </motion.div>

                <motion.div
                    ref={contentRef}
                    initial={{ opacity: 0, y: 40 }}
                    animate={contentInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {/* Left Column: Bandas de progresión */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-[2rem] border border-white/10 p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="w-6 h-6 text-[#88e04f]" />
                            <h3 className="text-xl font-bold text-white">
                                Sistema de Bandas
                            </h3>
                        </div>

                        <div className="flex flex-col gap-6">
                            {bandas.map((banda, index) => (
                                <div key={banda.name} className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                                                style={{ backgroundColor: banda.color }}
                                            >
                                                {banda.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">
                                                    {banda.name}
                                                </p>
                                                <p className="text-xs text-white/50">
                                                    {banda.levels}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className="text-sm font-bold"
                                            style={{ color: banda.color }}
                                        >
                                            {banda.progress}%
                                        </span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: banda.color }}
                                            initial={{ width: 0 }}
                                            animate={
                                                contentInView
                                                    ? { width: `${banda.progress}%` }
                                                    : {}
                                            }
                                            transition={{
                                                duration: 1.2,
                                                delay: 0.3 + index * 0.2,
                                                ease: "easeOut",
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* XP Counter */}
                        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#f5e211]/20 flex items-center justify-center">
                                    <Star className="w-5 h-5 text-[#f5e211]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/50">XP Total</p>
                                    <p className="text-2xl font-black text-white">
                                        1,250
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#ff705d]/20 flex items-center justify-center">
                                    <Flame className="w-5 h-5 text-[#ff705d]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/50">Racha</p>
                                    <p className="text-2xl font-black text-white">
                                        12 días
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Logros */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-[2rem] border border-white/10 p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Trophy className="w-6 h-6 text-[#f5e211]" />
                            <h3 className="text-xl font-bold text-white">
                                Logros y Medallas
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {achievements.map((achievement, index) => (
                                <motion.div
                                    key={achievement.name}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={
                                        contentInView
                                            ? { opacity: 1, scale: 1 }
                                            : {}
                                    }
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.4 + index * 0.1,
                                        type: "spring",
                                    }}
                                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-colors ${
                                        achievement.unlocked
                                            ? "bg-white/5 border-white/10"
                                            : "bg-white/[0.02] border-white/5 opacity-40"
                                    }`}
                                >
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                            achievement.unlocked
                                                ? "text-white"
                                                : "text-white/30"
                                        }`}
                                        style={{
                                            backgroundColor: achievement.unlocked
                                                ? `${achievement.color}30`
                                                : "rgba(255,255,255,0.05)",
                                        }}
                                    >
                                        {achievement.icon}
                                    </div>
                                    <span
                                        className={`text-xs font-semibold text-center leading-tight ${
                                            achievement.unlocked
                                                ? "text-white/80"
                                                : "text-white/30"
                                        }`}
                                    >
                                        {achievement.name}
                                    </span>
                                    {!achievement.unlocked && (
                                        <span className="text-[10px] text-white/20 font-medium">
                                            Bloqueado
                                        </span>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Streak week visualization */}
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <p className="text-sm text-white/50 mb-4 font-medium">
                                Racha semanal
                            </p>
                            <div className="flex justify-between gap-2">
                                {["L", "M", "X", "J", "V", "S", "D"].map(
                                    (day, i) => {
                                        const active = i < 5;
                                        return (
                                            <div
                                                key={day}
                                                className="flex flex-col items-center gap-2 flex-1"
                                            >
                                                <motion.div
                                                    className={`w-full aspect-square rounded-xl flex items-center justify-center ${
                                                        active
                                                            ? "bg-[#88e04f]"
                                                            : "bg-white/5"
                                                    }`}
                                                    initial={{ scale: 0 }}
                                                    animate={
                                                        contentInView
                                                            ? { scale: 1 }
                                                            : {}
                                                    }
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: 0.6 + i * 0.08,
                                                        type: "spring",
                                                    }}
                                                >
                                                    {active && (
                                                        <Flame className="w-4 h-4 text-[#1a1a1a]" />
                                                    )}
                                                </motion.div>
                                                <span
                                                    className={`text-xs font-semibold ${
                                                        active
                                                            ? "text-white/80"
                                                            : "text-white/30"
                                                    }`}
                                                >
                                                    {day}
                                                </span>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
