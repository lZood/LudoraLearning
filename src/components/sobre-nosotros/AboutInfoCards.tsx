"use client";

import React from "react";
import { motion } from "framer-motion";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";

const neueMachina = localFont({
    src: "../../../public/fonts/NeueMachina-Ultrabold.otf",
    display: "swap",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

const manifesto = [
    "Creemos que aprender un idioma no debería sentirse como tarea.",
    "Creemos que los videojuegos son la herramienta educativa más subestimada del planeta.",
    "Creemos que la diversión y el aprendizaje no son opuestos — son aliados.",
    "Creemos que cada alumno merece un espacio donde equivocarse sea parte del juego.",
];

const milestones = [
    {
        year: "2022",
        title: "La idea nace en un server de MC",
        description:
            "Un grupo de amigos descubre que llevan años aprendiendo inglés sin darse cuenta — jugando Minecraft. Nace la pregunta: ¿y si convertimos esto en un método real?",
        accent: "#88e04f",
    },
    {
        year: "2023",
        title: "Primer alumno, primera clase",
        description:
            "Sin oficina, sin inversión, solo con un servidor y muchas ganas. El primer alumno entra al mundo y en 40 minutos ya está hablando más inglés que en un semestre de escuela.",
        accent: "#8B5CF6",
    },
    {
        year: "2024",
        title: "El equipo crece",
        description:
            "Se unen maestros, desarrolladores y artistas. El servidor se transforma en un ecosistema pedagógico con mundos diseñados para cada nivel de inglés.",
        accent: "#56ccf2",
    },
    {
        year: "2025",
        title: "Ludora hoy",
        description:
            "Más de cien alumnos han pasado por nuestros mundos. Seguimos construyendo, experimentando y demostrando que se puede aprender jugando.",
        accent: "#f59e0b",
    },
];

export default function AboutInfoCards() {
    return (
        <section className="relative w-full overflow-hidden">
            {/* ── Manifesto ── */}
            <div className="relative bg-[#1a1a2e] py-32 md:py-44 px-6">
                {/* Grid bg */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: "32px 32px",
                    }}
                />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className={`text-[#88e04f] text-sm tracking-[0.3em] uppercase mb-14 font-semibold text-center ${montserrat.className}`}
                    >
                        Lo que creemos
                    </motion.div>

                    <div className="flex flex-col gap-10 md:gap-14">
                        {manifesto.map((line, i) => (
                            <motion.p
                                key={i}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 0.9, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.6, delay: i * 0.08 }}
                                className={`text-2xl sm:text-3xl md:text-4xl text-white font-bold leading-snug tracking-tight ${neueMachina.className}`}
                            >
                                {line}
                            </motion.p>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Timeline ── */}
            <div className="relative bg-[#f5f1e4] py-32 md:py-44 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-20"
                    >
                        <span className={`text-[#8B5CF6] text-sm tracking-[0.3em] uppercase font-semibold block mb-5 ${montserrat.className}`}>
                            Cómo llegamos aquí
                        </span>
                        <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black text-[#1a1a1a] tracking-tight ${neueMachina.className}`}>
                            NUESTRA LÍNEA DEL TIEMPO
                        </h2>
                    </motion.div>

                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-[#1a1a2e]/10 md:-translate-x-px" />

                        <div className="flex flex-col gap-16 md:gap-24">
                            {milestones.map((ms, i) => {
                                const isLeft = i % 2 === 0;
                                return (
                                    <motion.div
                                        key={ms.year}
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 pl-16 md:pl-0 ${
                                            isLeft ? "md:flex-row" : "md:flex-row-reverse"
                                        }`}
                                    >
                                        {/* Dot on line */}
                                        <div
                                            className="absolute left-[18px] md:left-1/2 md:-translate-x-1/2 w-5 h-5 rounded-full border-4 border-[#f5f1e4] z-10 shadow-sm"
                                            style={{ backgroundColor: ms.accent }}
                                        />

                                        {/* Content card */}
                                        <div className={`flex-1 ${isLeft ? "md:text-right" : "md:text-left"}`}>
                                            <div
                                                className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-4"
                                                style={{
                                                    backgroundColor: `${ms.accent}18`,
                                                    color: ms.accent,
                                                }}
                                            >
                                                {ms.year}
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] tracking-tight mb-3">
                                                {ms.title}
                                            </h3>
                                            <p className={`text-[#666] text-base md:text-lg leading-relaxed max-w-md ${isLeft ? "md:ml-auto" : ""} ${montserrat.className}`}>
                                                {ms.description}
                                            </p>
                                        </div>

                                        {/* Spacer for the other side */}
                                        <div className="hidden md:block flex-1" />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
