"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
    Map,
    Headphones,
    MessageSquare,
    Trophy,
    Flame,
    BookOpen,
    Gamepad2,
    ClipboardCheck,
} from "lucide-react";

const features = [
    {
        title: "Mapa de Cursos",
        description:
            "8 niveles con 48 unidades que te llevan desde lo básico hasta conversaciones con confianza.",
        icon: <Map className="w-7 h-7" />,
        color: "#2ba0ff",
        bgColor: "bg-[#2ba0ff]",
        tags: ["8 Niveles", "48 Unidades", "3 Bandas"],
    },
    {
        title: "6 Actividades por Unidad",
        description:
            "Teoría, ejercicios, audio, examen parcial, chat y evaluación final en cada unidad.",
        icon: <BookOpen className="w-7 h-7" />,
        color: "#88e04f",
        bgColor: "bg-[#88e04f]",
        tags: ["Teoría", "Audio", "Chat", "Examen"],
    },
    {
        title: "Materiales Interactivos",
        description:
            "Dictados, videos interactivos, crucigramas, juegos de memoria y ejercicios drag & drop.",
        icon: <Gamepad2 className="w-7 h-7" />,
        color: "#ff705d",
        bgColor: "bg-[#ff705d]",
        tags: ["Crucigramas", "Memory", "Quizzes"],
    },
    {
        title: "Evaluación Adaptativa",
        description:
            "Nuestro sistema detecta tu nivel real con un test adaptativo en 5 categorías distintas.",
        icon: <ClipboardCheck className="w-7 h-7" />,
        color: "#9b51e0",
        bgColor: "bg-[#9b51e0]",
        tags: ["5 Categorías", "Adaptativo", "Personalizado"],
    },
];

const miniStats = [
    { icon: <Flame className="w-5 h-5" />, label: "Rachas diarias", color: "#ff705d" },
    { icon: <Trophy className="w-5 h-5" />, label: "Logros y XP", color: "#f5e211" },
    { icon: <Headphones className="w-5 h-5" />, label: "Audio inmersivo", color: "#2ba0ff" },
    { icon: <MessageSquare className="w-5 h-5" />, label: "Chat en vivo", color: "#88e04f" },
];

function FeatureCard({
    feature,
    index,
}: {
    feature: (typeof features)[0];
    index: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" }}
            className="group relative flex flex-col bg-white rounded-[2rem] overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition-shadow duration-500"
        >
            {/* Header con icono */}
            <div
                className="flex items-center gap-4 p-6 pb-4"
            >
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: feature.color }}
                >
                    {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] leading-tight">
                    {feature.title}
                </h3>
            </div>

            {/* Descripcion */}
            <p className="text-base text-[#1a1a1a]/70 leading-relaxed px-6 pb-4 flex-grow">
                {feature.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 px-6 pb-6">
                {feature.tags.map((tag) => (
                    <span
                        key={tag}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full"
                        style={{
                            backgroundColor: `${feature.color}15`,
                            color: feature.color,
                        }}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </motion.div>
    );
}

export default function PlatformPreview() {
    const headerRef = useRef<HTMLDivElement>(null);
    const headerInView = useInView(headerRef, { once: true, margin: "-10% 0px" });
    const statsRef = useRef<HTMLDivElement>(null);
    const statsInView = useInView(statsRef, { once: true, margin: "-10% 0px" });

    return (
        <section className="relative w-full bg-[#e0dbce] rounded-t-[50px] rounded-b-[50px] py-24 md:py-32 overflow-hidden">
            <div className="max-w-[85vw] mx-auto">
                {/* Header */}
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1a1a1a] tracking-tight leading-tight mb-6">
                        Todo lo que necesitas{" "}
                        <br className="hidden md:block" />
                        para aprender inglés
                    </h2>
                    <p className="text-lg md:text-xl text-[#1a1a1a]/70 max-w-2xl mx-auto font-medium leading-relaxed">
                        Una plataforma completa con cursos estructurados, materiales
                        interactivos y un sistema de progresión que te mantiene motivado.
                    </p>
                </motion.div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.title}
                            feature={feature}
                            index={index}
                        />
                    ))}
                </div>

                {/* Mini Stats Bar */}
                <motion.div
                    ref={statsRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={statsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-[#1a1a1a] rounded-[2rem] p-6 md:p-8"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {miniStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="flex items-center gap-3"
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{
                                        backgroundColor: `${stat.color}20`,
                                        color: stat.color,
                                    }}
                                >
                                    {stat.icon}
                                </div>
                                <span className="text-sm md:text-base font-semibold text-white/90">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
