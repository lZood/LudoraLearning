"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";

const comparisonRows = [
    "Inmersión al 100% en inglés",
    "Maestros reales en clases en vivo",
    "Aprendizaje práctico dentro de un videojuego",
    "Misiones y retos que refuerzan vocabulario",
    "Portal con cursos, videos y evaluaciones",
    "Ambiente seguro para perder el miedo a hablar",
    "Comunidad activa de estudiantes",
];

const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const rowVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: "easeOut" },
    },
};

export default function ServicesDifference() {
    return (
        <section className="relative w-full bg-white rounded-[50px] overflow-hidden px-6 py-20 md:py-28">
            <div className="relative z-10 max-w-5xl mx-auto w-full">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#222222] tracking-tight leading-[1.1]">
                        Por qué elegir <span className="text-[#632eaf]">Ludora</span> <br className="hidden md:block" />
                        sobre el método tradicional
                    </h2>
                </motion.div>

                {/* Comparison table */}
                <div className="grid grid-cols-2 gap-0">

                    {/* Column headers */}
                    <div className="pb-5 pr-6 md:pr-10 border-b border-gray-200">
                        <h3 className="text-lg md:text-2xl font-black text-[#632eaf] text-right md:text-left">
                            Ludora Learning
                        </h3>
                    </div>
                    <div className="pb-5 pl-6 md:pl-10 border-b border-gray-200 border-l-2 border-l-gray-100">
                        <h3 className="text-lg md:text-2xl font-black text-gray-400">
                            Método tradicional
                        </h3>
                    </div>

                    {/* Rows */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        className="col-span-2 grid grid-cols-2"
                    >
                        {comparisonRows.map((feature, i) => (
                            <React.Fragment key={feature}>
                                {/* Ludora side */}
                                <motion.div
                                    variants={rowVariants}
                                    className="flex items-center gap-3 py-4 md:py-5 pr-6 md:pr-10 text-right md:text-left justify-end md:justify-start"
                                >
                                    <div className="flex items-center gap-3 order-2 md:order-1">
                                        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#632eaf] flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" strokeWidth={3} />
                                        </div>
                                        <span className="text-sm md:text-base text-[#1d1d1b] font-semibold leading-snug">
                                            {feature}
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Tradicional side */}
                                <motion.div
                                    variants={rowVariants}
                                    className="flex items-center gap-3 py-4 md:py-5 pl-6 md:pl-10 border-l-2 border-gray-100"
                                >
                                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                        <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" strokeWidth={3} />
                                    </div>
                                    <span className="text-sm md:text-base text-gray-400 font-medium leading-snug line-through decoration-gray-300">
                                        {feature}
                                    </span>
                                </motion.div>
                            </React.Fragment>
                        ))}
                    </motion.div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex justify-center mt-16"
                >
                    <Link
                        href="/portal-alumno/evaluacion"
                        className="group inline-flex items-center gap-3 bg-[#632eaf] hover:bg-[#4a1f8a] text-white px-8 py-4 rounded-full font-bold text-base transition-colors duration-300 shadow-lg hover:shadow-xl"
                    >
                        Empieza tu evaluación gratis
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
