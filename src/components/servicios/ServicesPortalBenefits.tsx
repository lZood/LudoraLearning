"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

/* ── Pixel check (igual estilo que ServicePricing) ── */
const PixelCheck = ({ color }: { color: string }) => (
    <svg
        width="12"
        height="12"
        viewBox="0 0 14 14"
        className="shrink-0 mt-1"
        style={{ imageRendering: "pixelated" }}
    >
        <rect x="10" y="3" width="2" height="2" fill={color} />
        <rect x="8" y="5" width="2" height="2" fill={color} />
        <rect x="6" y="7" width="2" height="2" fill={color} />
        <rect x="4" y="9" width="2" height="2" fill={color} />
        <rect x="2" y="7" width="2" height="2" fill={color} />
    </svg>
);

type Benefit = {
    tag: string;
    title: string;
    description: string;
    bullets: string[];
    accent: string;        // color brand para títulos / checks / pill text
    pastel: string;        // pastel para fondo del hero glow + pill bg
    ringTint: string;      // ring color del card
    hero: () => React.ReactNode;
};

/* ── Hero floats (animación simple "flotar") ── */
const float = (delay = 0, distance = 6) => ({
    animate: { y: [0, -distance, 0] },
    transition: {
        duration: 3 + delay * 0.4,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay,
    },
});

/* ── Heroes por beneficio ── */
const HeroMaterial = () => (
    <div className="relative w-full h-[180px] flex items-center justify-center">
        {/* Glow pastel */}
        <div className="absolute w-[150px] h-[150px] rounded-full bg-[#c8e4fb]/70 blur-2xl" />
        {/* Imagen central */}
        <motion.img
            src="/images/estrategia-page/bookshelf.webp"
            alt="Bookshelf"
            className="relative w-[125px] h-[125px] object-contain drop-shadow-[0_8px_15px_rgba(43,160,255,0.25)]"
            style={{ imageRendering: "pixelated" }}
            {...float(0)}
        />
    </div>
);

const HeroGamificacion = () => (
    <div className="relative w-full h-[180px] flex items-center justify-center">
        {/* Glow pastel verde */}
        <div className="absolute w-[150px] h-[150px] rounded-full bg-[#d4f5c0]/80 blur-2xl" />

        {/* Diamante satélite top-left */}
        <motion.img
            src="/images/service-page/diamond.webp"
            alt=""
            className="absolute top-3 left-[18%] w-[42px] h-[42px] object-contain drop-shadow-md"
            style={{ imageRendering: "pixelated" }}
            {...float(0.4, 5)}
        />

        {/* Esmeralda principal */}
        <motion.img
            src="/images/service-page/emerald.png"
            alt="Emerald"
            className="relative w-[105px] h-[105px] object-contain drop-shadow-[0_8px_15px_rgba(45,138,58,0.3)] z-10"
            {...float(0)}
        />

        {/* Espadas satélite bottom-right */}
        <motion.img
            src="/images/service-page/swords.webp"
            alt=""
            className="absolute bottom-3 right-[18%] w-[46px] h-[46px] object-contain drop-shadow-md"
            style={{ imageRendering: "pixelated" }}
            {...float(0.7, 5)}
        />
    </div>
);

const HeroBiblioteca = () => (
    <div className="relative w-full h-[180px] flex items-center justify-center">
        {/* Glow pastel morado */}
        <div className="absolute w-[160px] h-[160px] rounded-full bg-[#e5d5ff]/80 blur-2xl" />
        {/* Ender chest gif */}
        <motion.img
            src="/images/service-page/enderchest.gif"
            alt="Ender chest"
            className="relative w-[125px] h-[125px] object-contain drop-shadow-[0_8px_15px_rgba(99,46,175,0.3)]"
            style={{ imageRendering: "pixelated" }}
            {...float(0.2, 4)}
        />
    </div>
);

const benefits: Benefit[] = [
    {
        tag: "MATERIAL INTERACTIVO",
        title: "Aprende con material interactivo y IA",
        description:
            "Flashcards, quizzes, crucigramas, dictados y juegos de memoria. Nuestra IA evalúa tu pronunciación al instante.",
        bullets: [
            "Flashcards y quizzes adaptativos",
            "IA que corrige tu pronunciación",
            "Crucigramas, dictados y memoramas",
        ],
        accent: "#2ba0ff",
        pastel: "#c8e4fb",
        ringTint: "rgba(43,160,255,0.25)",
        hero: HeroMaterial,
    },
    {
        tag: "GAMIFICACIÓN",
        title: "Sube de liga mientras aprendes",
        description:
            "Gana XP y monedas Ludora, sube de Carbón a Netherite, desbloquea logros y compite en leaderboards semanales.",
        bullets: [
            "Ligas: Carbón → Netherite",
            "Logros y monedas Ludora",
            "Leaderboards semanales",
        ],
        accent: "#2d8a3a",
        pastel: "#d4f5c0",
        ringTint: "rgba(136,224,79,0.35)",
        hero: HeroGamificacion,
    },
    {
        tag: "BIBLIOTECA",
        title: "Tu biblioteca de clases grabadas",
        description:
            "Videos de gramática, vocabulario, pronunciación y conversación siempre disponibles. Repasa a tu ritmo cuando quieras.",
        bullets: [
            "Videos siempre disponibles 24/7",
            "Gramática, vocabulario y conversación",
            "Repasa cuantas veces quieras",
        ],
        accent: "#632eaf",
        pastel: "#e5d5ff",
        ringTint: "rgba(168,107,255,0.3)",
        hero: HeroBiblioteca,
    },
];

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, type: "spring", bounce: 0.2 },
    },
};

const bulletContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
};

const bulletItem: Variants = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const BenefitCard = ({ benefit }: { benefit: Benefit }) => {
    const Hero = benefit.hero;
    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="group relative overflow-hidden rounded-[28px] bg-white p-5 sm:p-6 lg:p-8 flex flex-col"
            style={{
                boxShadow: `0 14px 38px -14px ${benefit.ringTint}, 0 2px 6px rgba(60,40,15,0.06)`,
                border: `1px solid ${benefit.ringTint}`,
            }}
        >
            {/* Hero */}
            <Hero />

            {/* Pill tag */}
            <div className="mt-2 mb-3 flex justify-center">
                <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-[0.16em]"
                    style={{
                        backgroundColor: benefit.pastel,
                        color: benefit.accent,
                    }}
                >
                    {benefit.tag}
                </span>
            </div>

            {/* Title */}
            <h3
                className="text-xl md:text-2xl font-black tracking-tight text-center leading-tight mb-3"
                style={{ color: benefit.accent }}
            >
                {benefit.title}
            </h3>

            {/* Description */}
            <p className="text-sm md:text-[15px] text-[#3a3a3a]/80 leading-relaxed text-center mb-5">
                {benefit.description}
            </p>

            {/* Divider */}
            <div className="flex items-center gap-2 mb-4">
                <span className="h-px flex-1" style={{ backgroundColor: `${benefit.accent}25` }} />
                <span
                    className="text-[10px] font-black uppercase tracking-[0.18em]"
                    style={{ color: `${benefit.accent}99` }}
                >
                    incluye
                </span>
                <span className="h-px flex-1" style={{ backgroundColor: `${benefit.accent}25` }} />
            </div>

            {/* Bullets */}
            <motion.ul
                variants={bulletContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col gap-2"
            >
                {benefit.bullets.map((b) => (
                    <motion.li
                        key={b}
                        variants={bulletItem}
                        className="flex items-start gap-2.5"
                    >
                        <PixelCheck color={benefit.accent} />
                        <span className="text-xs md:text-sm text-[#3a3a3a] font-medium leading-snug">
                            {b}
                        </span>
                    </motion.li>
                ))}
            </motion.ul>

            {/* Glow del color al hover */}
            <div
                className="absolute -bottom-20 -right-20 w-44 h-44 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${benefit.pastel} 0%, transparent 70%)`,
                }}
            />
        </motion.div>
    );
};

export default function ServicesPortalBenefits() {
    return (
        <section className="relative w-full bg-[#ff705d] rounded-[50px] overflow-hidden px-4 sm:px-6 py-16 md:py-24 min-h-screen flex flex-col justify-center">
            {/* Nubes pastel decorativas */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-[8%] left-[5%] w-40 h-24 rounded-full bg-white/25 blur-3xl"
                    animate={{ x: [0, 30, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-[10%] right-[8%] w-48 h-28 rounded-full bg-white/20 blur-3xl"
                    animate={{ x: [0, -20, 0] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto w-full">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.25 }}
                    className="text-center mb-14 md:mb-16"
                >
                    <span className="inline-block bg-white/90 text-[#ff705d] text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-5 shadow-sm">
                        Portal de Alumnos
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] drop-shadow-[2px_2px_0_rgba(170,40,30,0.35)]">
                        3 razones para elegir nuestro{" "}
                        <span className="text-[#632eaf]">Portal de Alumnos</span>
                    </h2>
                    <p className="mt-4 text-sm md:text-base text-white/95 max-w-2xl mx-auto font-medium">
                        Acceso completo desde tu primer módulo. Aprende, juega y mejora a tu propio ritmo.
                    </p>
                </motion.div>

                {/* Cards grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7"
                >
                    {benefits.map((b) => (
                        <BenefitCard key={b.tag} benefit={b} />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
