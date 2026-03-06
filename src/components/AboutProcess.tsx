"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { X, CheckCircle2, ShieldCheck, BookOpen, Clock } from "lucide-react";

export default function AboutProcess() {
    const steps = [
        {
            title: "Diagnóstico",
            description: "Evaluamos el nivel actual para ubicarlo en la etapa adecuada.",
            icon: BookOpen,
            color: "text-[#86d2fb]",
            bg: "bg-[#86d2fb]/10"
        },
        {
            title: "Mundo Asignado",
            description: "Un entorno de Minecraft a medida, seguro y controlado por nuestros maestros.",
            icon: ShieldCheck,
            color: "text-[#f59e0b]",
            bg: "bg-[#f59e0b]/10"
        },
        {
            title: "Misiones Dinámicas",
            description: "Aprende gramática y vocabulario real superando desafíos dentro del juego.",
            icon: Clock,
            color: "text-[#ef4444]",
            bg: "bg-[#ef4444]/10"
        },
        {
            title: "Resultados Tangibles",
            description: "Fluidez natural, confianza al hablar y cero frustración.",
            icon: CheckCircle2,
            color: "text-[#8ED462]",
            bg: "bg-[#8ED462]/10"
        }
    ];

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.2 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.5, type: "spring", bounce: 0.3 },
        },
    };

    return (
        <section className="relative w-full min-h-screen bg-white rounded-[50px] overflow-hidden flex flex-col items-center justify-center px-6 py-28 md:py-36">
            <div className="relative z-10 max-w-7xl mx-auto w-full">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                    className="text-center mb-20"
                >
                    <span className="inline-block bg-[#86d2fb]/15 text-[#2a8ebd] px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-[0.15em] mb-6">
                        ⚙️ Cómo Funciona
                    </span>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#222222] tracking-tight leading-[1.05]">
                        Nuestro{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#86d2fb] to-[#3b82f6]">
                            proceso
                        </span>
                    </h2>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative"
                >
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-1 bg-gradient-to-r from-[#86d2fb]/20 via-[#f59e0b]/20 to-[#8ED462]/20 z-0 rounded-full" />

                    {steps.map((step, index) => (
                        <motion.div key={index} variants={itemVariants} className="relative z-10 flex flex-col items-center text-center">
                            {/* Number Badge */}
                            <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#fafafa] rounded-full border-4 border-white shadow-sm flex items-center justify-center font-black text-gray-400 z-20">
                                {index + 1}
                            </div>

                            {/* Icon Box */}
                            <div className={`w-32 h-32 rounded-[30px] ${step.bg} ${step.color} flex items-center justify-center mb-8 rotate-3 hover:translate-y-[-10px] hover:shadow-xl transition-all duration-300 border-4 border-white shadow-md`}>
                                <step.icon size={48} strokeWidth={2} className="-rotate-3" />
                            </div>

                            {/* Text */}
                            <h3 className="text-2xl font-black text-[#222222] mb-4">{step.title}</h3>
                            <p className="text-gray-500 font-medium leading-relaxed max-w-xs">{step.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
