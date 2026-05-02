"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

/* ── Pixel Check icon (wrapped in circle) ── */
const PixelCheckCircle = ({ color, bg }: { color: string; bg: string }) => (
    <div
        className="shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center"
        style={{ backgroundColor: bg }}
    >
        <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            style={{ imageRendering: "pixelated" }}
        >
            <rect x="10" y="3" width="2" height="2" fill={color} />
            <rect x="8" y="5" width="2" height="2" fill={color} />
            <rect x="6" y="7" width="2" height="2" fill={color} />
            <rect x="4" y="9" width="2" height="2" fill={color} />
            <rect x="2" y="7" width="2" height="2" fill={color} />
        </svg>
    </div>
);

/* ── Pixel X icon (wrapped in circle) ── */
const PixelXCircle = ({ color, bg }: { color: string; bg: string }) => (
    <div
        className="shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center"
        style={{ backgroundColor: bg }}
    >
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            style={{ imageRendering: "pixelated" }}
        >
            <rect x="2" y="2" width="2" height="2" fill={color} />
            <rect x="8" y="2" width="2" height="2" fill={color} />
            <rect x="4" y="4" width="2" height="2" fill={color} />
            <rect x="6" y="4" width="2" height="2" fill={color} />
            <rect x="4" y="6" width="2" height="2" fill={color} />
            <rect x="6" y="6" width="2" height="2" fill={color} />
            <rect x="2" y="8" width="2" height="2" fill={color} />
            <rect x="8" y="8" width="2" height="2" fill={color} />
        </svg>
    </div>
);

const comparisonRows = [
    {
        ludora: "Clases dinámicas, interactivas y vivas (no solo escuchar, sino participar)",
        traditional: "Clases pasivas y repetitivas (escuchar y copiar)",
    },
    {
        ludora: "Uso de videojuegos y escenarios reales que hacen el idioma útil y memorable",
        traditional: "Ejercicios poco relevantes para la vida real",
    },
    {
        ludora: "Enfoque en comunicación real, no solo teoría",
        traditional: "Mucha teoría, poca práctica real",
    },
    {
        ludora: "Corrección inmediata que te ayuda a mejorar en el momento",
        traditional: "Correcciones tardías que no ayudan a mejorar en el momento",
    },
    {
        ludora: "Desarrollo de confianza al hablar, sin miedo ni presión",
        traditional: "Miedo a equivocarte frente al grupo",
    },
    {
        ludora: "Aprendizaje personalizado a tu ritmo y nivel real",
        traditional: "Mismo ritmo para todos, aunque te quedes atrás o te aburras",
    },
    {
        ludora: "Motivación constante (progreso visible, logros y retos)",
        traditional: "Memorizas reglas pero no sabes usarlas al hablar",
    },
];

const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

const rowVariants: Variants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.35, ease: "easeOut" },
    },
};

export default function ServicesDifference() {
    return (
        <section className="relative w-full bg-[#88e04f] rounded-[50px] overflow-hidden px-6 py-20 md:py-28 min-h-screen flex flex-col justify-center">
            <div className="relative z-10 max-w-5xl mx-auto w-full">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14 md:mb-20"
                >
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#1d1d1b] tracking-tight leading-[1.1]">
                        Por qué elegir <span className="text-[#632eaf]">Ludora</span> <br className="hidden md:block" />
                        sobre el método tradicional
                    </h2>
                    <p className="mt-5 text-base md:text-lg text-[#1d1d1b]/70 font-medium max-w-2xl mx-auto">
                        No nos quedamos atrás. Usamos metodologías y herramientas modernas para que realmente aprendas a comunicarte.
                    </p>
                </motion.div>

                {/* Comparison table */}
                <div className="grid grid-cols-2 gap-0 bg-white rounded-[32px] p-6 md:p-10 shadow-xl">

                    {/* Column headers */}
                    <div className="pb-5 pr-6 md:pr-10 border-b-2 border-gray-200">
                        <h3 className="text-lg md:text-2xl font-black text-[#632eaf] text-right md:text-left">
                            Ludora Learning
                        </h3>
                    </div>
                    <div className="pb-5 pl-6 md:pl-10 border-b-2 border-gray-200 border-l-2 border-l-gray-100">
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
                        {comparisonRows.map((row, i) => (
                            <React.Fragment key={i}>
                                {/* Ludora side */}
                                <motion.div
                                    variants={rowVariants}
                                    className="flex items-center gap-3 py-4 md:py-5 pr-6 md:pr-10 text-right md:text-left justify-end md:justify-start"
                                >
                                    <div className="flex items-center gap-3 order-2 md:order-1">
                                        <PixelCheckCircle color="#ffffff" bg="#632eaf" />
                                        <span className="text-sm md:text-base text-[#1d1d1b] font-semibold leading-snug">
                                            {row.ludora}
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Tradicional side */}
                                <motion.div
                                    variants={rowVariants}
                                    className="flex items-center gap-3 py-4 md:py-5 pl-6 md:pl-10 border-l-2 border-gray-100"
                                >
                                    <PixelXCircle color="#9CA3AF" bg="#f5f5f5" />
                                    <span className="text-sm md:text-base text-gray-400 font-medium leading-snug line-through decoration-gray-300">
                                        {row.traditional}
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
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 16 16"
                            className="group-hover:translate-x-1 transition-transform"
                            style={{ imageRendering: "pixelated" }}
                        >
                            <rect x="8" y="3" width="2" height="2" fill="#ffffff" />
                            <rect x="10" y="5" width="2" height="2" fill="#ffffff" />
                            <rect x="12" y="7" width="2" height="2" fill="#ffffff" />
                            <rect x="2" y="7" width="10" height="2" fill="#ffffff" />
                            <rect x="10" y="9" width="2" height="2" fill="#ffffff" />
                            <rect x="8" y="11" width="2" height="2" fill="#ffffff" />
                        </svg>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
