"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Section = {
    id: string;
    label: string;
    title: string;
    titleAccent: string;
    color: string;
    iconSrc: string;
    imageSrc: string;
    paragraphs: React.ReactNode[];
};

const sections: Section[] = [
    {
        id: "origen",
        label: "El Origen",
        title: "El Origen",
        titleAccent: "de Ludora",
        color: "#c4b5fd",
        iconSrc: "/images/estrategia-page/grassblock.webp",
        imageSrc: "/images/estrategia-page/MineCocina.webp",
        paragraphs: [
            <>Ludora nace de lo <strong>"lúdico"</strong>: aprender jugando. Creemos que el inglés no debe ser una obligación escolar, sino una herramienta para explorar y crear.</>,
            <>Aquí, la curiosidad es el motor del aprendizaje y los errores son solo parte de la aventura. Nuestro objetivo es que los alumnos adquieran el idioma de una forma natural.</>,
        ],
    },
    {
        id: "planeacion",
        label: "Planeación",
        title: "Planeación",
        titleAccent: "Académica",
        color: "#7dd3fc",
        iconSrc: "/images/estrategia-page/book.webp",
        imageSrc: "/images/estrategia-page/planeacion.webp",
        paragraphs: [
            <>Detrás de cada bloque hay una <strong>estructura pedagógica sólida</strong>. Nuestras sesiones son diseñadas por maestros certificados apasionados de los videojuegos.</>,
            <>Cada clase tiene objetivos claros que se sienten como una tarde de juego, permitiendo que los alumnos desarrollen habilidades lingüísticas reales.</>,
        ],
    },
    {
        id: "minecraft",
        label: "Aprender Jugando",
        title: "Aprender Jugando",
        titleAccent: "en Minecraft",
        color: "#bef264",
        iconSrc: "/images/estrategia-page/fishing.webp",
        imageSrc: "/images/estrategia-page/pescando.webp",
        paragraphs: [
            <>Aquí la teoría cobra vida. Un equipo especializado traduce nuestras planeaciones en <strong>misiones y mini-juegos únicos</strong>.</>,
            <>No solo enseñamos vocabulario; creamos experiencias donde los alumnos deben usar el inglés para avanzar, integrando la gramática de forma orgánica.</>,
        ],
    },
    {
        id: "pronunciacion",
        label: "Pronunciación",
        title: "Pronunciación",
        titleAccent: "Inteligente",
        color: "#67e8f9",
        iconSrc: "/images/estrategia-page/Blue_Orchid_JE7_BE2.webp",
        imageSrc: "/images/estrategia-page/bakuMinecraft.webp",
        paragraphs: [
            <>No solo enseñamos vocabulario, también enseñamos cómo <strong>suena realmente el inglés</strong>. Utilizamos herramientas de fonética y fonología diseñadas para hispanohablantes.</>,
            <>Estas habilidades se practican dentro de Minecraft y con material especializado en el portal, incluyendo cuadros fonéticos y videos de articulación.</>,
        ],
    },
    {
        id: "uso-real",
        label: "Uso Real",
        title: "Uso Real",
        titleAccent: "del Idioma",
        color: "#fcd34d",
        iconSrc: "/images/estrategia-page/bookshelf.webp",
        imageSrc: "/images/estrategia-page/mineconversacion.webp",
        paragraphs: [
            <>En Ludora, aprender un idioma significa <strong>saber usarlo</strong>. Fomentamos la comunicación constante: desde niveles básicos hasta la inmersión total.</>,
            <>Los estudiantes dejan de repetir frases de memoria para negociar con sus compañeros, logrando que el listening y el speaking fluyan de manera espontánea.</>,
        ],
    },
    {
        id: "resultados",
        label: "Resultados",
        title: "Resultados",
        titleAccent: "del Método",
        color: "#fca5a5",
        iconSrc: "/images/estrategia-page/Enchanted_Golden.gif",
        imageSrc: "/images/estrategia-page/resultados.webp",
        paragraphs: [
            <>Los resultados son duraderos porque <strong>vinculamos el idioma con experiencias positivas</strong>.</>,
            <>Al usar el inglés para superar retos, los alumnos retienen la información con mayor facilidad y ganan la confianza necesaria para comunicarse en situaciones reales.</>,
        ],
    },
];

export default function EstrategiaBlackboard() {
    const [activeId, setActiveId] = useState(sections[0].id);
    const active = sections.find((s) => s.id === activeId) ?? sections[0];

    return (
        <section
            className="relative w-full -mt-[50px]"
            style={{
                // Top 60px transparent → top corners reveal the Hero behind
                // Bottom area cream (#f2eee1) → bottom corners blend with that color
                background:
                    "linear-gradient(to bottom, transparent 0px, transparent 60px, #f2eee1 60px, #f2eee1 100%)",
            }}
        >
            {/* Outer wooden card — rounded top & bottom; the section bg around the corners is the chalkboard green so it blends */}
            <div
                className="relative w-full min-h-screen overflow-hidden p-3 sm:p-4 md:p-5 rounded-[50px]"
                style={{
                    background:
                        "linear-gradient(135deg, #b8854a 0%, #9c6b35 25%, #c4915a 50%, #8a5a2a 75%, #b8854a 100%)",
                    boxShadow:
                        "inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.3), 0 10px 40px -10px rgba(0,0,0,0.25)",
                }}
            >
                {/* Wood grain overlay on the frame */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay rounded-[50px]"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.08) 1px, transparent 3px, rgba(255,255,255,0.05) 5px, transparent 8px)",
                    }}
                />

                {/* Chalkboard fills the section (minus the wood frame padding) */}
                <div
                    className="relative w-full min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-2.5rem)] overflow-hidden rounded-[38px] sm:rounded-[40px] md:rounded-[42px]"
                    style={{
                        background:
                            "radial-gradient(ellipse at 30% 20%, #3d6b4a 0%, #2d5238 40%, #1f3d28 100%)",
                        boxShadow:
                            "inset 0 0 120px rgba(0,0,0,0.55), inset 0 0 30px rgba(255,255,255,0.05)",
                    }}
                >
                {/* Chalk dust texture */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-25"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.18) 0%, transparent 40%), radial-gradient(circle at 75% 60%, rgba(255,255,255,0.12) 0%, transparent 45%), radial-gradient(circle at 50% 90%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 90% 15%, rgba(255,255,255,0.1) 0%, transparent 35%)",
                    }}
                />

                {/* Floating content */}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 md:gap-10 lg:gap-14 px-5 sm:px-8 md:px-12 lg:px-16 py-10 md:py-14 lg:py-20 min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-2.5rem)] items-center">
                    {/* LEFT: Cozy paper-note tab buttons */}
                    <nav
                        className="flex flex-row lg:flex-col gap-3 md:gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0"
                        aria-label="Secciones de la estrategia"
                    >
                        {sections.map((s, i) => {
                            const isActive = s.id === activeId;
                            // Slight, deterministic rotation per index so it feels hand-pinned
                            const rotations = [-1.5, 1, -0.8, 1.4, -1.2, 0.9];
                            const rot = rotations[i % rotations.length];
                            return (
                                <motion.button
                                    key={s.id}
                                    onClick={() => setActiveId(s.id)}
                                    whileHover={{ rotate: 0, y: -2, scale: 1.03 }}
                                    animate={{ rotate: isActive ? 0 : rot, scale: isActive ? 1.04 : 1 }}
                                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                                    className="relative flex-shrink-0 w-auto lg:w-full text-left px-4 md:px-5 py-3 md:py-3.5 text-sm md:text-[15px] font-semibold whitespace-nowrap lg:whitespace-normal"
                                    style={{
                                        background: isActive
                                            ? "linear-gradient(180deg, #fbf3df 0%, #f3e4c2 100%)"
                                            : "linear-gradient(180deg, #f0e4c8 0%, #e6d6b0 100%)",
                                        color: "#3b2a18",
                                        borderRadius: "14px 16px 13px 17px",
                                        boxShadow: isActive
                                            ? `0 0 0 2px ${s.color}, 0 0 22px ${s.color}55, 0 8px 18px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.6)`
                                            : "0 4px 10px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    {/* Colored "washi tape" accent on the left edge */}
                                    <span
                                        aria-hidden
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-r-sm"
                                        style={{
                                            background: s.color,
                                            opacity: isActive ? 1 : 0.55,
                                            boxShadow: isActive ? `0 0 10px ${s.color}` : "none",
                                        }}
                                    />
                                    <span className="pl-2 inline-block">{s.label}</span>
                                </motion.button>
                            );
                        })}
                    </nav>

                    {/* RIGHT: Content floats directly on chalkboard */}
                    <div className="relative min-h-[420px] md:min-h-[460px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={active.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                                className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-12 w-full max-w-[1100px] mx-auto"
                            >
                                {/* Image — 50% on md+, right-aligned to stay close to text */}
                                <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                                    <div className="relative aspect-square w-full max-w-[360px] lg:max-w-[420px] flex items-center justify-center">
                                        <img
                                            src={active.imageSrc}
                                            alt=""
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Text — 50% on md+, left-aligned to stay close to image */}
                                <div className="w-full md:w-1/2 flex flex-col gap-4 md:gap-5 max-w-[520px]">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div
                                            className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center overflow-hidden"
                                            style={{
                                                background: "rgba(255,255,255,0.08)",
                                                border: `2px solid ${active.color}`,
                                                boxShadow: `0 0 16px ${active.color}55`,
                                            }}
                                        >
                                            <img
                                                src={active.iconSrc}
                                                alt=""
                                                className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow"
                                            />
                                        </div>
                                        <h2
                                            className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-[1.05] text-white"
                                            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                                        >
                                            {active.title}{" "}
                                            <span style={{ color: active.color, textShadow: `0 0 18px ${active.color}77` }}>
                                                {active.titleAccent}
                                            </span>
                                        </h2>
                                    </div>

                                    <div
                                        className="flex flex-col gap-3 md:gap-4 [&_strong]:text-[var(--accent-strong)] [&_strong]:font-bold [&_strong]:drop-shadow"
                                        style={{ ["--accent-strong" as any]: active.color }}
                                    >
                                        {active.paragraphs.map((p, i) => (
                                            <p
                                                key={i}
                                                className={
                                                    i === 0
                                                        ? "text-base md:text-lg font-medium leading-relaxed text-white/90"
                                                        : "text-sm md:text-base font-medium leading-relaxed text-white/70"
                                                }
                                                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
                                            >
                                                {p}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Eraser — 3× larger, stuck to the right edge of the chalkboard */}
                <div
                    className="absolute right-0 bottom-8 md:bottom-12 w-48 h-[72px] md:w-72 md:h-24 rounded-l-sm pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(180deg, #f5e6c8 0%, #e8d4a8 50%, #c89858 50%, #a67838 100%)",
                        boxShadow: "0 6px 14px rgba(0,0,0,0.55), -2px 0 6px rgba(0,0,0,0.25)",
                    }}
                />
                </div>
            </div>
        </section>
    );
}

