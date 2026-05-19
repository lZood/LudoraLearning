"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
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

type Story = {
    chapter: string;
    title: string;
    body: string;
    bg: string;
    fg: string;
    accent: string;
};

const stories: Story[] = [
    {
        chapter: "01",
        title: "Crecimos jugando, aprendimos jugando",
        body:
            "Nuestro equipo creció rodeado de videojuegos y, con ellos, del idioma inglés. Desde una edad temprana descubrimos que jugar no solo era entretenimiento, sino también una herramienta de aprendizaje increíblemente poderosa. La necesidad de comunicarnos con jugadores de otros países, comprender menús, seguir instrucciones y participar en comunidades internacionales nos llevó, de manera natural, a desarrollar habilidades de speaking, listening, reading e incluso writing en inglés.",
        bg: "#2ba0ff",
        fg: "#ffffff",
        accent: "rgba(255,255,255,0.18)",
    },
    {
        chapter: "02",
        title: "De jugadores a creadores",
        body:
            "Además de nuestra experiencia como jugadores, varios integrantes de nuestro equipo comenzaron desde muy jóvenes (entre los 12 y 15 años) a explorar el mundo de la creación digital dentro de Minecraft. Con el tiempo, desarrollamos habilidades en la creación de Add-Ons, skinpacks y mapas para la Marketplace de Minecraft, aprendiendo sobre diseño, trabajo en equipo y desarrollo de proyectos digitales.",
        bg: "#ff705d",
        fg: "#ffffff",
        accent: "rgba(255,255,255,0.18)",
    },
    {
        chapter: "03",
        title: "Una idea con propósito",
        body:
            "En 2025 decidimos unir todas esas experiencias, habilidades y herramientas para crear algo con propósito: un espacio donde más personas pudieran descubrir el potencial educativo, creativo y social de los videojuegos, tal como nosotros lo hicimos. Creemos que aprender puede ser una experiencia divertida, inmersiva y significativa cuando se conecta con aquello que realmente apasiona a las personas.",
        bg: "#88e04f",
        fg: "#1a1a1a",
        accent: "rgba(0,0,0,0.10)",
    },
    {
        chapter: "04",
        title: "Así nace Ludora",
        body:
            "Un proyecto que busca transformar los videojuegos en una puerta hacia el aprendizaje, la creatividad y la conexión con el mundo.",
        bg: "#632fae",
        fg: "#ffffff",
        accent: "rgba(255,255,255,0.18)",
    },
];

const AUTO_MS = 8000;

// Variants for staggered text reveal inside a card
const contentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
};

const wordVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: 0.1 + i * 0.045, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function AboutInfoCards() {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (paused) return;
        timerRef.current = setTimeout(() => {
            setActive((prev) => (prev + 1) % stories.length);
        }, AUTO_MS);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [active, paused]);

    const story = stories[active];
    const titleWords = story.title.split(" ");

    return (
        <section className="relative w-full bg-[#f5f1e4] py-24 md:py-32 px-6 overflow-hidden">
            {/* Soft floating page-level decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: `${80 + i * 40}px`,
                            height: `${80 + i * 40}px`,
                            background: `radial-gradient(circle, ${story.bg}22, transparent 70%)`,
                            left: `${10 + i * 18}%`,
                            top: `${5 + (i % 3) * 25}%`,
                            transition: "background 0.8s ease",
                        }}
                        animate={{
                            y: [0, -20, 0],
                            scale: [1, 1.08, 1],
                        }}
                        transition={{
                            duration: 6 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.6,
                        }}
                    />
                ))}
            </div>

            <div className="relative max-w-6xl mx-auto z-10">
                {/* Heading */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={contentVariants}
                    className="text-center mb-12 md:mb-16"
                >
                    <motion.span
                        variants={itemVariants}
                        className={`text-[#8B5CF6] text-sm tracking-[0.3em] uppercase font-semibold block mb-4 ${montserrat.className}`}
                    >
                        Cómo llegamos aquí
                    </motion.span>
                    <motion.h2
                        variants={itemVariants}
                        className={`text-4xl md:text-5xl lg:text-6xl font-black text-[#1a1a1a] tracking-tight ${neueMachina.className}`}
                    >
                        NUESTRA HISTORIA
                    </motion.h2>
                </motion.div>

                {/* Carousel */}
                <motion.div
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full rounded-[32px] overflow-hidden min-h-[480px] md:min-h-[520px] flex shadow-2xl"
                    style={{
                        background: story.bg,
                        transition: "background-color 0.8s ease, background 0.8s ease, box-shadow 0.8s ease",
                        boxShadow: `0 30px 60px -20px ${story.bg}55, 0 12px 25px -10px rgba(0,0,0,0.25)`,
                    }}
                >
                    {/* Floating pixel-style decorations inside the card */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={`${active}-${i}`}
                                className="absolute rounded-sm"
                                style={{
                                    width: `${8 + (i % 3) * 4}px`,
                                    height: `${8 + (i % 3) * 4}px`,
                                    background: story.fg,
                                    opacity: 0.08 + (i % 3) * 0.04,
                                    left: `${15 + i * 14}%`,
                                    top: `${10 + (i % 4) * 20}%`,
                                }}
                                animate={{
                                    y: [0, -16, 0],
                                    rotate: [0, 12, 0],
                                    opacity: [0.08, 0.18, 0.08],
                                }}
                                transition={{
                                    duration: 4 + i * 0.6,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: i * 0.35,
                                }}
                            />
                        ))}
                    </div>

                    {/* Left: vertical progress bars */}
                    <div className="flex flex-col justify-center gap-3 pl-5 md:pl-8 py-10 z-20">
                        {stories.map((_, i) => {
                            const isActive = i === active;
                            return (
                                <motion.button
                                    key={i}
                                    onClick={() => setActive(i)}
                                    aria-label={`Ir a la sección ${i + 1}`}
                                    whileHover={{ scaleY: 1.15, opacity: 1 }}
                                    whileTap={{ scale: 0.92 }}
                                    animate={
                                        isActive
                                            ? { height: 56, opacity: 1 }
                                            : { height: 14, opacity: 0.35 }
                                    }
                                    transition={{
                                        type: "spring",
                                        stiffness: 280,
                                        damping: 24,
                                    }}
                                    className="block rounded-full cursor-pointer"
                                    style={{
                                        width: "4px",
                                        background: story.fg,
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Right: content */}
                    <div className="flex-1 relative z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={active}
                                variants={contentVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, x: -30, transition: { duration: 0.35 } }}
                                className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-8 md:gap-12 items-center h-full px-6 sm:px-10 md:px-14 py-12 md:py-14"
                                style={{ color: story.fg }}
                            >
                                {/* Text block */}
                                <div className="flex flex-col gap-5">
                                    <motion.span
                                        variants={itemVariants}
                                        className={`text-xs md:text-sm tracking-[0.25em] uppercase font-semibold ${montserrat.className}`}
                                        style={{ opacity: 0.7 }}
                                    >
                                        Capítulo {story.chapter}
                                    </motion.span>

                                    {/* Title with word-by-word reveal */}
                                    <h3 className={`text-3xl md:text-4xl lg:text-[2.75rem] font-black tracking-tight leading-[1.05] ${neueMachina.className}`}>
                                        {titleWords.map((w, i) => (
                                            <motion.span
                                                key={`${active}-${i}`}
                                                custom={i}
                                                variants={wordVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className="inline-block mr-[0.25em]"
                                            >
                                                {w}
                                            </motion.span>
                                        ))}
                                    </h3>

                                    <motion.p
                                        variants={itemVariants}
                                        className={`text-base md:text-lg leading-relaxed ${montserrat.className}`}
                                        style={{ opacity: 0.88 }}
                                    >
                                        {story.body}
                                    </motion.p>
                                </div>

                                {/* Visual side: big chapter number with spring entry + idle float */}
                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.04, rotate: -1 }}
                                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                                    className="rounded-[24px] aspect-square w-full max-w-[320px] mx-auto md:mx-0 flex items-center justify-center relative overflow-hidden"
                                    style={{ background: story.accent }}
                                >
                                    {/* Inner glow that pulses */}
                                    <motion.div
                                        className="absolute inset-0 rounded-[24px]"
                                        animate={{ opacity: [0.3, 0.55, 0.3] }}
                                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                                        style={{
                                            background: `radial-gradient(circle at 30% 30%, ${story.fg}22, transparent 70%)`,
                                        }}
                                    />

                                    {/* The big chapter number, with continuous gentle float */}
                                    <motion.span
                                        initial={{ scale: 0.55, rotate: -8, opacity: 0 }}
                                        animate={{ scale: 1, rotate: 0, opacity: 0.45 }}
                                        transition={{
                                            duration: 0.85,
                                            ease: [0.34, 1.56, 0.64, 1],
                                            delay: 0.15,
                                        }}
                                        className={`text-[140px] md:text-[180px] leading-none font-black select-none ${neueMachina.className}`}
                                        style={{ color: story.fg }}
                                    >
                                        <motion.span
                                            animate={{ y: [0, -8, 0] }}
                                            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                                            className="inline-block"
                                        >
                                            {story.chapter}
                                        </motion.span>
                                    </motion.span>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Auto-advance progress line at the bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 z-20" style={{ background: story.accent }}>
                            {!paused && (
                                <motion.div
                                    key={`bar-${active}`}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: AUTO_MS / 1000, ease: "linear" }}
                                    className="h-full origin-left"
                                    style={{ background: story.fg, opacity: 0.75 }}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
