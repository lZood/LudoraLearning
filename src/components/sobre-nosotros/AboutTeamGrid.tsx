"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";

const neueMachina = localFont({
    src: "../../../public/fonts/NeueMachina-Ultrabold.otf",
    display: "swap",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

const teamMembers = [
    {
        name: "Fernando Santiago",
        role: "Director & Game-Dev",
        image: "/images/sobre-nosotros/derlect.webp",
        mcTag: "Derlect",
        accent: "#ff705d",
        quote: "Los videojuegos me enseñaron más que cualquier libro de texto. Ahora quiero que otros vivan lo mismo.",
        fact: "Lleva construyendo mundos en Minecraft desde los 12 años.",
    },
    {
        name: "Valeria Velázquez",
        role: "Directora & Maestra",
        image: "/images/sobre-nosotros/vale.webp",
        mcTag: "valeust",
        accent: "#b794f6",
        quote: "La mejor clase es la que no se siente como clase.",
        fact: "Combina pedagogía tradicional con dinámicas de juego.",
    },
    {
        name: "José Ramirez",
        role: "Web-Dev",
        image: "/images/sobre-nosotros/cucho.webp",
        mcTag: "Zood",
        accent: "#2ba0ff",
        quote: "El código es otro lenguaje más — lo aprendí igual que el inglés: usándolo.",
        fact: "Construyó la plataforma completa de Ludora desde cero.",
    },
    {
        name: "Luis Cortes",
        role: "Game-Dev",
        image: "/images/sobre-nosotros/pammsitoh.webp",
        mcTag: "Pammsitoh",
        accent: "#88e04f",
        quote: "Si se puede soñar, se puede programar.",
        fact: "Diseña las mecánicas de juego que hacen las clases inmersivas.",
    },
    {
        name: "Maximiliano Bustos",
        role: "Artista PixelArt",
        image: "/images/sobre-nosotros/baku.webp",
        mcTag: "bakuretsubv",
        accent: "#f59e0b",
        quote: "Cada pixel cuenta una historia. Yo me encargo de que sea épica.",
        fact: "Crea todas las texturas y assets visuales de los mundos.",
    },
    {
        name: "Kevin Bedoya",
        role: "Game-Dev",
        image: "/images/sobre-nosotros/kevin.webp",
        mcTag: "KevinAlexJn",
        accent: "#2dd4bf",
        quote: "La creatividad no tiene límites cuando el medio es un videojuego.",
        fact: "Especialista en comandos y sistemas de Minecraft.",
    },
];

function TeamModal({ selected, onClose }: { selected: number; onClose: () => void }) {
    const member = teamMembers[selected];

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
            style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md animate-[modalIn_0.25s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="relative overflow-hidden rounded-3xl border-2 shadow-2xl"
                    style={{
                        borderColor: `${member.accent}40`,
                        background: "#2a2a3e",
                    }}
                >
                    {/* Top bar */}
                    <div
                        className="flex items-center justify-between px-5 py-3 rounded-t-[22px]"
                        style={{ backgroundColor: member.accent }}
                    >
                        <span className="text-white font-bold text-sm tracking-wide">
                            {member.mcTag}
                        </span>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white bg-black/15 hover:bg-black/30 transition-colors rounded-full font-bold text-sm"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-7">
                        {/* Avatar + name */}
                        <div className="flex items-center gap-4 mb-6">
                            <div
                                className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded-2xl border-3"
                                style={{ borderColor: member.accent }}
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className={`text-white font-bold text-xl sm:text-2xl leading-tight ${neueMachina.className}`}>
                                    {member.name}
                                </h3>
                                <div
                                    className="inline-block mt-2 px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full"
                                    style={{
                                        backgroundColor: `${member.accent}20`,
                                        color: member.accent,
                                        border: `1.5px solid ${member.accent}35`,
                                    }}
                                >
                                    {member.role}
                                </div>
                            </div>
                        </div>

                        {/* Quote */}
                        <div className="mb-5 p-4 rounded-2xl bg-white/5 border border-white/[0.06]">
                            <p className={`text-white/80 text-base sm:text-lg leading-relaxed italic ${montserrat.className}`}>
                                &ldquo;{member.quote}&rdquo;
                            </p>
                        </div>

                        {/* Fun fact */}
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                            <span
                                className="text-xs font-bold tracking-[0.15em] uppercase block mb-2"
                                style={{ color: member.accent }}
                            >
                                Dato curioso
                            </span>
                            <p className={`text-white/55 text-sm leading-relaxed ${montserrat.className}`}>
                                {member.fact}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function AboutTeamGrid() {
    const [selected, setSelected] = useState<number | null>(null);
    const handleClose = useCallback(() => setSelected(null), []);

    useEffect(() => {
        if (selected !== null) {
            document.body.style.overflow = "hidden";
            const handleKey = (e: KeyboardEvent) => {
                if (e.key === "Escape") setSelected(null);
            };
            window.addEventListener("keydown", handleKey);
            return () => {
                document.body.style.overflow = "";
                window.removeEventListener("keydown", handleKey);
            };
        } else {
            document.body.style.overflow = "";
        }
    }, [selected]);

    return (
        <section className="relative w-full bg-[#1a1a2e] rounded-[50px] py-32 md:py-44 px-6 overflow-hidden">
            {/* Subtle grid bg */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: "16px 16px",
                }}
            />

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-20"
                >
                    <span className={`text-[#88e04f] text-sm tracking-[0.3em] uppercase font-semibold block mb-5 ${montserrat.className}`}>
                        Los personajes
                    </span>
                    <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight ${neueMachina.className}`}>
                        CONOCE AL EQUIPO
                    </h2>
                </motion.div>

                {/* Mosaic grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {teamMembers.map((member, i) => (
                        <motion.div
                            key={member.mcTag}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                            onClick={() => setSelected(i)}
                            className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl md:rounded-3xl border-2 border-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
                        >
                            {/* Image */}
                            <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Nametag floating above */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <div
                                    className="px-3 py-1 text-xs font-bold tracking-wider text-white whitespace-nowrap rounded-full"
                                    style={{
                                        backgroundColor: "rgba(0,0,0,0.6)",
                                        border: `1.5px solid ${member.accent}70`,
                                    }}
                                >
                                    {member.mcTag}
                                </div>
                            </div>

                            {/* Info bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-white font-bold text-sm md:text-lg leading-tight">
                                    {member.name}
                                </h3>
                                <div
                                    className={`text-xs mt-1 font-semibold ${montserrat.className}`}
                                    style={{ color: member.accent }}
                                >
                                    {member.role}
                                </div>
                            </div>

                            {/* Accent glow on hover */}
                            <div
                                className="absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                style={{
                                    boxShadow: `inset 0 0 30px ${member.accent}20`,
                                }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Hint */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className={`text-center text-white/25 text-sm mt-8 ${montserrat.className}`}
                >
                    Haz click en un miembro para conocer más
                </motion.p>
            </div>

            {/* Modal rendered via portal */}
            {selected !== null && (
                <TeamModal selected={selected} onClose={handleClose} />
            )}
        </section>
    );
}
