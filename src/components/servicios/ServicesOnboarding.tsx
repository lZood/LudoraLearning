"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Brain, CheckCircle2, ArrowRight, Play, BookOpen, BarChart3 } from "lucide-react";

/* ── Mockup: Evaluación de nivel ── */
const TrialMockup = () => (
    <div className="relative w-full max-w-[240px] mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-[#88e04f] px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-white" />
                <span className="text-white text-[10px] font-bold">Evaluación de nivel</span>
            </div>
            <span className="text-white text-[9px] font-bold">4/5</span>
        </div>
        <div className="p-3 space-y-2">
            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#88e04f]" style={{ width: "80%" }} />
            </div>

            {/* Question */}
            <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-[8px] font-semibold text-[#88e04f] uppercase tracking-wide mb-1">Gramática</p>
                <p className="text-[10px] font-bold text-[#1d1d1b] leading-snug">Choose the correct option:</p>
                <p className="text-[9px] text-gray-600 mt-0.5">She ___ to the park every day.</p>
            </div>

            {/* Options */}
            <div className="space-y-1">
                {[
                    { label: "go", selected: false },
                    { label: "goes", selected: true },
                    { label: "going", selected: false },
                ].map((opt) => (
                    <div
                        key={opt.label}
                        className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 border ${opt.selected
                            ? "bg-[#88e04f]/10 border-[#88e04f]"
                            : "bg-white border-gray-100"
                            }`}
                    >
                        <div
                            className={`w-2.5 h-2.5 rounded-full border ${opt.selected ? "border-[#88e04f] bg-[#88e04f]" : "border-gray-300"
                                } flex items-center justify-center`}
                        >
                            {opt.selected && <div className="w-1 h-1 rounded-full bg-white" />}
                        </div>
                        <span className={`text-[9px] font-medium ${opt.selected ? "text-[#1d1d1b] font-bold" : "text-gray-600"}`}>
                            {opt.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/* ── Mockup: Inscripción ── */
const EnrollMockup = () => (
    <div className="relative w-full max-w-[240px] mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-[#632eaf] px-3 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-[10px] font-bold">Elige tu plan</span>
        </div>
        <div className="p-3 space-y-2">
            {/* Plan 1 */}
            <div className="rounded-lg p-2.5 border-2 border-gray-100">
                <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
                        <span className="text-[10px] font-bold text-[#1d1d1b]">Plataforma</span>
                    </div>
                    <span className="text-[10px] font-black text-[#1d1d1b]">$349</span>
                </div>
                <p className="text-[8px] text-gray-400 leading-snug ml-4.5 pl-1">
                    Portal de alumnos + contenido
                </p>
            </div>

            {/* Plan 2 — Active */}
            <div className="relative rounded-lg p-2.5 border-2 border-[#632eaf] bg-[#632eaf]/5">
                <div className="absolute -top-1.5 right-2 bg-[#632eaf] text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full">
                    POPULAR
                </div>
                <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full border-2 border-[#632eaf] bg-[#632eaf] flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-white" />
                        </div>
                        <span className="text-[10px] font-bold text-[#1d1d1b]">Plataforma Plus</span>
                    </div>
                    <span className="text-[10px] font-black text-[#1d1d1b]">$599</span>
                </div>
                <p className="text-[8px] text-gray-500 leading-snug pl-4.5 ml-1">
                    Todo + clases en vivo en Minecraft
                </p>
            </div>

            <div className="bg-[#632eaf] text-white text-[9px] font-bold text-center py-1.5 rounded-lg">
                Confirmar inscripción
            </div>
        </div>
    </div>
);

/* ── Mockup: Juega y aprende — Portal de alumnos ── */
const PlayMockup = () => (
    <div className="relative w-full max-w-[240px] mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-[#ff705d] px-3 py-2 flex items-center justify-between">
            <span className="text-white text-[10px] font-bold">Portal de Alumnos</span>
            <span className="text-white/70 text-[8px] font-semibold">Hola, Alex</span>
        </div>
        <div className="p-3 space-y-2">
            {/* Level + progress */}
            <div className="flex items-center gap-2">
                <div className="bg-[#ff705d]/10 rounded-lg px-2 py-1.5 flex-1">
                    <p className="text-[7px] text-gray-400 uppercase font-bold tracking-wide">Nivel</p>
                    <p className="text-sm font-black text-[#ff705d] leading-none">B1</p>
                </div>
                <div className="bg-[#88e04f]/10 rounded-lg px-2 py-1.5 flex-1">
                    <p className="text-[7px] text-gray-400 uppercase font-bold tracking-wide">Racha</p>
                    <p className="text-sm font-black text-[#2d8a1e] leading-none">12 🔥</p>
                </div>
            </div>

            {/* Courses */}
            <div className="space-y-1">
                <div className="flex items-center gap-1.5 bg-gray-50 rounded-md px-2 py-1.5">
                    <div className="w-5 h-5 rounded bg-[#86d2fb]/20 flex items-center justify-center shrink-0">
                        <BookOpen className="w-2.5 h-2.5 text-[#2ba0ff]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-[#1d1d1b] truncate">Grammar Essentials</p>
                        <div className="w-full h-0.5 bg-gray-200 rounded-full overflow-hidden mt-0.5">
                            <div className="h-full bg-[#2ba0ff]" style={{ width: "75%" }} />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 rounded-md px-2 py-1.5">
                    <div className="w-5 h-5 rounded bg-[#ff705d]/20 flex items-center justify-center shrink-0">
                        <Play className="w-2.5 h-2.5 text-[#ff705d] ml-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-[#1d1d1b] truncate">Videos · Unit 4</p>
                        <div className="w-full h-0.5 bg-gray-200 rounded-full overflow-hidden mt-0.5">
                            <div className="h-full bg-[#ff705d]" style={{ width: "40%" }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Next live class — reinforces Minecraft tie-in */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] rounded-lg px-2 py-1.5">
                <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[7px] text-white/50 uppercase font-bold tracking-wide">Próxima clase</p>
                    <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[6px] font-bold text-green-400">EN VIVO</span>
                    </div>
                </div>
                <p className="text-[9px] font-black text-white leading-tight">Build a village</p>
                <p className="text-[7px] text-white/60">Hoy · 16:00 · Minecraft</p>
            </div>
        </div>
    </div>
);

type Step = {
    number: string;
    title: string;
    description: string;
    accent: string;
    mockupBg: string;
    Mockup: React.FC;
};

const steps: Step[] = [
    {
        number: "01",
        title: "Evaluación de nivel",
        description: "Haz nuestra evaluación gratuita en la plataforma para conocer tu nivel de inglés y ubicarte correctamente.",
        accent: "#88e04f",
        mockupBg: "bg-gradient-to-br from-[#d4f5c0] to-[#88e04f]/30",
        Mockup: TrialMockup,
    },
    {
        number: "02",
        title: "Inscríbete",
        description: "Elige entre Plataforma o Plataforma Plus con clases en vivo, y obtén acceso inmediato a todo el contenido.",
        accent: "#632eaf",
        mockupBg: "bg-gradient-to-br from-[#e5d5ff] to-[#632eaf]/25",
        Mockup: EnrollMockup,
    },
    {
        number: "03",
        title: "Juega y aprende",
        description: "Avanza en el portal con cursos y videos, y aplica lo aprendido en el servidor privado de Minecraft.",
        accent: "#ff705d",
        mockupBg: "bg-gradient-to-br from-[#ffd9d1] to-[#ff705d]/30",
        Mockup: PlayMockup,
    },
];

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, type: "spring", bounce: 0.25 },
    },
};

export default function ServicesOnboarding() {
    return (
        <section className="relative w-full bg-white rounded-[50px] overflow-hidden px-6 py-16 md:py-20 min-h-screen flex flex-col justify-center">
            <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#222222] tracking-tight leading-[1.05]">
                        Tu aventura empieza en <span className="text-[#632eaf]">3 pasos</span>
                    </h2>
                </motion.div>

                {/* Steps grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
                >
                    {steps.map((step) => {
                        const Mockup = step.Mockup;
                        return (
                            <motion.div
                                key={step.number}
                                variants={itemVariants}
                                className="flex flex-col"
                            >
                                {/* Mockup card */}
                                <div className={`${step.mockupBg} rounded-[24px] p-6 md:p-6 flex items-center justify-center h-[280px] md:h-[300px] mb-4 overflow-hidden`}>
                                    <Mockup />
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-2 px-1">
                                    <h3 className="text-xl md:text-2xl font-black text-[#1d1d1b] leading-tight">
                                        <span style={{ color: step.accent }}>{step.number}.</span>{" "}
                                        {step.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex justify-center"
                >
                    <Link
                        href="/portal-alumno/evaluacion"
                        className="group inline-flex items-center gap-3 bg-[#1d1d1b] hover:bg-[#632eaf] text-white px-8 py-4 rounded-full font-bold text-base transition-colors duration-300 shadow-lg hover:shadow-xl"
                    >
                        Empieza tu evaluación gratis
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
