"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { UserPlus, ClipboardCheck, Layers, Pickaxe } from "lucide-react";

const steps = [
    {
        number: "01",
        title: "Crea tu cuenta",
        description:
            "Regístrate en segundos con tu correo o Google. Sin tarjeta, sin compromisos.",
        icon: <UserPlus className="w-7 h-7" />,
        color: "#2ba0ff",
    },
    {
        number: "02",
        title: "Toma tu evaluación",
        description:
            "Nuestro test adaptativo analiza 5 habilidades para asignarte la banda perfecta.",
        icon: <ClipboardCheck className="w-7 h-7" />,
        color: "#9b51e0",
    },
    {
        number: "03",
        title: "Accede a tu banda",
        description:
            "Desbloquea 3 niveles de prueba con unidades completas: teoría, audio, chat y exámenes.",
        icon: <Layers className="w-7 h-7" />,
        color: "#88e04f",
    },
    {
        number: "04",
        title: "Aprende jugando",
        description:
            "Avanza por el mapa de cursos dentro de Minecraft mientras dominas el inglés.",
        icon: <Pickaxe className="w-7 h-7" />,
        color: "#ff705d",
    },
];

function StepCard({
    step,
    index,
    total,
}: {
    step: (typeof steps)[0];
    index: number;
    total: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="relative flex flex-col items-center text-center"
        >
            {/* Connector line (not on last item) */}
            {index < total - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-[2px] bg-[#1a1a1a]/10 z-0" />
            )}

            {/* Icon circle */}
            <div
                className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg"
                style={{ backgroundColor: step.color }}
            >
                {step.icon}
            </div>

            {/* Step number */}
            <span
                className="text-sm font-bold tracking-widest uppercase mb-2"
                style={{ color: step.color }}
            >
                Paso {step.number}
            </span>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-bold text-[#1a1a1a] mb-3">
                {step.title}
            </h3>

            {/* Description */}
            <p className="text-base text-[#1a1a1a]/70 leading-relaxed max-w-[260px]">
                {step.description}
            </p>
        </motion.div>
    );
}

export default function HowItWorks() {
    const headerRef = useRef<HTMLDivElement>(null);
    const headerInView = useInView(headerRef, { once: true, margin: "-10% 0px" });

    return (
        <section className="relative w-full bg-[#f5f1e4] py-24 md:py-32 overflow-hidden">
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
                        Empieza en{" "}
                        <span className="text-[#88e04f]">4 pasos</span>
                    </h2>
                    <p className="text-lg md:text-xl text-[#1a1a1a]/70 max-w-2xl mx-auto font-medium leading-relaxed">
                        De cero a aprender inglés dentro de Minecraft en minutos.
                    </p>
                </motion.div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                    {steps.map((step, index) => (
                        <StepCard
                            key={step.number}
                            step={step}
                            index={index}
                            total={steps.length}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
