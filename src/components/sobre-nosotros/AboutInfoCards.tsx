"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    const [direction, setDirection] = useState<1 | -1>(1);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const goTo = (i: number) => {
        setDirection(i > active || (active === stories.length - 1 && i === 0) ? 1 : -1);
        setActive(((i % stories.length) + stories.length) % stories.length);
    };
    const next = () => {
        setDirection(1);
        setActive((p) => (p + 1) % stories.length);
    };
    const prev = () => {
        setDirection(-1);
        setActive((p) => (p - 1 + stories.length) % stories.length);
    };

    useEffect(() => {
        if (paused) return;
        timerRef.current = setTimeout(() => {
            setDirection(1);
            setActive((prev) => (prev + 1) % stories.length);
        }, AUTO_MS);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [active, paused]);

    // Keyboard arrows for accessibility
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") next();
            else if (e.key === "ArrowLeft") prev();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const story = stories[active];
    const titleWords = story.title.split(" ");

    return (
        <section className="relative w-full bg-[#1a1a2e] py-20 md:py-32 px-4 sm:px-6 overflow-hidden">
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
                    className="text-center mb-10 md:mb-14"
                >
                    <motion.span
                        variants={itemVariants}
                        className={`text-[#88e04f] text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold block mb-3 md:mb-4 ${montserrat.className}`}
                    >
                        Cómo llegamos aquí
                    </motion.span>
                    <motion.h2
                        variants={itemVariants}
                        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight ${neueMachina.className}`}
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
                    className="relative w-full rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
                    style={{
                        background: story.bg,
                        transition: "background-color 0.8s ease, background 0.8s ease, box-shadow 0.8s ease",
                        boxShadow: `0 30px 60px -20px ${story.bg}55, 0 12px 25px -10px rgba(0,0,0,0.25)`,
                        minHeight: "clamp(520px, 70vh, 600px)",
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

                    {/* Content area (draggable for swipe) */}
                    <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.18}
                        onDragEnd={(_, info) => {
                            if (info.offset.x < -60 || info.velocity.x < -300) next();
                            else if (info.offset.x > 60 || info.velocity.x > 300) prev();
                        }}
                        className="relative flex-1 z-10 cursor-grab active:cursor-grabbing select-none touch-pan-y"
                    >
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={active}
                                variants={contentVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, x: direction * -30, transition: { duration: 0.3 } }}
                                className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6 md:gap-12 items-center h-full px-5 sm:px-8 md:px-14 pt-12 sm:pt-14 md:pt-16 pb-24 md:pb-28"
                                style={{ color: story.fg }}
                            >
                                {/* Text block */}
                                <div className="flex flex-col gap-4 md:gap-5 order-2 md:order-1">
                                    {/* Chapter chip (visible on mobile, hidden on md+) */}
                                    <motion.div
                                        variants={itemVariants}
                                        className="flex items-center gap-2 md:hidden"
                                    >
                                        <span
                                            className={`text-[10px] tracking-[0.25em] uppercase font-bold px-3 py-1.5 rounded-full ${montserrat.className}`}
                                            style={{
                                                background: story.accent,
                                                color: story.fg,
                                            }}
                                        >
                                            Capítulo {story.chapter}
                                        </span>
                                        <span
                                            className={`text-[10px] tracking-[0.2em] uppercase font-semibold ${montserrat.className}`}
                                            style={{ opacity: 0.55 }}
                                        >
                                            {active + 1} / {stories.length}
                                        </span>
                                    </motion.div>

                                    {/* Capítulo label (desktop) */}
                                    <motion.span
                                        variants={itemVariants}
                                        className={`hidden md:block text-xs md:text-sm tracking-[0.25em] uppercase font-semibold ${montserrat.className}`}
                                        style={{ opacity: 0.7 }}
                                    >
                                        Capítulo {story.chapter}
                                    </motion.span>

                                    {/* Title with word-by-word reveal */}
                                    <h3 className={`text-[28px] leading-[1.05] sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black tracking-tight ${neueMachina.className}`}>
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
                                        className={`text-[15px] sm:text-base md:text-lg leading-relaxed ${montserrat.className}`}
                                        style={{ opacity: 0.88 }}
                                    >
                                        {story.body}
                                    </motion.p>
                                </div>

                                {/* Visual side: big chapter number (hidden on mobile to save space) */}
                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.04, rotate: -1 }}
                                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                                    className="hidden md:flex rounded-[24px] aspect-square w-full max-w-[320px] mx-auto md:mx-0 items-center justify-center relative overflow-hidden order-1 md:order-2"
                                    style={{ background: story.accent }}
                                >
                                    <motion.div
                                        className="absolute inset-0 rounded-[24px]"
                                        animate={{ opacity: [0.3, 0.55, 0.3] }}
                                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                                        style={{
                                            background: `radial-gradient(circle at 30% 30%, ${story.fg}22, transparent 70%)`,
                                        }}
                                    />
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
                    </motion.div>

                    {/* Bottom controls bar: prev arrow + horizontal pills + next arrow */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-4 px-4 sm:px-6 md:px-10 pb-5 sm:pb-6 md:pb-7">
                        {/* Prev */}
                        <motion.button
                            onClick={prev}
                            whileHover={{ scale: 1.08, x: -2 }}
                            whileTap={{ scale: 0.92 }}
                            aria-label="Capítulo anterior"
                            className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                            style={{
                                background: story.accent,
                                color: story.fg,
                                border: `1.5px solid ${story.fg}40`,
                            }}
                        >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                        </motion.button>

                        {/* Horizontal pills (also act as progress bar for the active one) */}
                        <div className="flex items-center gap-2 md:gap-2.5 flex-1 justify-center">
                            {stories.map((_, i) => {
                                const isActive = i === active;
                                return (
                                    <motion.button
                                        key={i}
                                        onClick={() => goTo(i)}
                                        whileHover={{ scaleY: 1.4 }}
                                        whileTap={{ scale: 0.92 }}
                                        animate={{
                                            width: isActive ? 56 : 10,
                                        }}
                                        transition={{ type: "spring", stiffness: 260, damping: 24 }}
                                        aria-label={`Ir a la sección ${i + 1}`}
                                        className="relative h-2 rounded-full overflow-hidden cursor-pointer"
                                        style={{
                                            background: `${story.fg}33`,
                                        }}
                                    >
                                        {isActive && (
                                            <motion.div
                                                key={`fill-${active}-${paused ? "p" : "r"}`}
                                                initial={paused ? false : { width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{
                                                    duration: paused ? 0 : AUTO_MS / 1000,
                                                    ease: "linear",
                                                }}
                                                className="absolute inset-y-0 left-0 rounded-full"
                                                style={{ background: story.fg }}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Next */}
                        <motion.button
                            onClick={next}
                            whileHover={{ scale: 1.08, x: 2 }}
                            whileTap={{ scale: 0.92 }}
                            aria-label="Siguiente capítulo"
                            className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                            style={{
                                background: story.accent,
                                color: story.fg,
                                border: `1.5px solid ${story.fg}40`,
                            }}
                        >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                        </motion.button>
                    </div>
                </motion.div>

                {/* Hint text below the carousel */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.55 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className={`text-center text-xs mt-5 md:mt-6 text-white ${montserrat.className}`}
                >
                    <span className="md:hidden">Desliza, toca las flechas o los puntos para navegar</span>
                    <span className="hidden md:inline">Usa las flechas, los puntos o las teclas ← → para cambiar de capítulo</span>
                </motion.p>
            </div>
        </section>
    );
}
