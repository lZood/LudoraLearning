"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function shade(hex: string, factor: number): string {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const r = Math.round(parseInt(full.slice(0, 2), 16) * factor);
    const g = Math.round(parseInt(full.slice(2, 4), 16) * factor);
    const b = Math.round(parseInt(full.slice(4, 6), 16) * factor);
    const to2 = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
    return `#${to2(r)}${to2(g)}${to2(b)}`;
}

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
            <>Ludora nace de lo <strong className="text-white">"lúdico"</strong>: aprender jugando. Creemos que el inglés no debe ser una obligación escolar, sino una herramienta para explorar y crear.</>,
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
            <>Detrás de cada bloque hay una <strong className="text-white">estructura pedagógica sólida</strong>. Nuestras sesiones son diseñadas por maestros certificados apasionados de los videojuegos.</>,
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
            <>Aquí la teoría cobra vida. Un equipo especializado traduce nuestras planeaciones en <strong className="text-white">misiones y mini-juegos únicos</strong>.</>,
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
            <>No solo enseñamos vocabulario, también enseñamos cómo <strong className="text-white">suena realmente el inglés</strong>. Utilizamos herramientas de fonética y fonología diseñadas para hispanohablantes.</>,
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
            <>En Ludora, aprender un idioma significa <strong className="text-white">saber usarlo</strong>. Fomentamos la comunicación constante: desde niveles básicos hasta la inmersión total.</>,
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
            <>Los resultados son duraderos porque <strong className="text-white">vinculamos el idioma con experiencias positivas</strong>.</>,
            <>Al usar el inglés para superar retos, los alumnos retienen la información con mayor facilidad y ganan la confianza necesaria para comunicarse en situaciones reales.</>,
        ],
    },
];

export default function EstrategiaBlackboard() {
    const [activeId, setActiveId] = useState(sections[0].id);
    const active = sections.find((s) => s.id === activeId) ?? sections[0];

    return (
        <section className="relative w-full min-h-screen bg-[#f0ecff] rounded-b-[50px] overflow-hidden flex items-center justify-center px-4 sm:px-6 py-20 md:py-28">
            {/* Outer wooden frame */}
            <div
                className="relative w-full max-w-[1280px] rounded-[28px] p-3 sm:p-4 md:p-6 shadow-2xl"
                style={{
                    background:
                        "linear-gradient(135deg, #b8854a 0%, #9c6b35 25%, #c4915a 50%, #8a5a2a 75%, #b8854a 100%)",
                    boxShadow:
                        "0 25px 60px -15px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.3)",
                }}
            >
                {/* Wood grain overlay */}
                <div
                    className="absolute inset-0 rounded-[28px] pointer-events-none opacity-30 mix-blend-overlay"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.08) 1px, transparent 3px, rgba(255,255,255,0.05) 5px, transparent 8px)",
                    }}
                />

                {/* Chalkboard interior */}
                <div
                    className="relative w-full rounded-[16px] overflow-hidden"
                    style={{
                        background:
                            "radial-gradient(ellipse at 30% 20%, #3d6b4a 0%, #2d5238 40%, #1f3d28 100%)",
                        boxShadow:
                            "inset 0 0 80px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.05)",
                    }}
                >
                    {/* Chalk dust texture */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 40%), radial-gradient(circle at 75% 60%, rgba(255,255,255,0.1) 0%, transparent 45%), radial-gradient(circle at 50% 90%, rgba(255,255,255,0.08) 0%, transparent 50%)",
                        }}
                    />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 md:gap-6 p-4 sm:p-6 md:p-8 lg:p-10">
                        {/* LEFT: Tab buttons */}
                        <nav
                            className="flex flex-row lg:flex-col gap-2 md:gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0"
                            aria-label="Secciones de la estrategia"
                        >
                            {sections.map((s) => {
                                const isActive = s.id === activeId;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setActiveId(s.id)}
                                        className="relative flex-shrink-0 w-auto lg:w-full text-left rounded-full px-4 md:px-5 py-2.5 md:py-3 text-sm md:text-[15px] font-semibold transition-all duration-300 whitespace-nowrap lg:whitespace-normal"
                                        style={{
                                            background: isActive ? "#e8e3d3" : "#d8d3c3",
                                            color: "#2d2d2d",
                                            boxShadow: isActive
                                                ? `0 0 0 3px ${s.color}, 0 0 18px ${s.color}55, inset 0 1px 2px rgba(255,255,255,0.6)`
                                                : "inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        {s.label}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* RIGHT: Content area */}
                        <div
                            className="relative rounded-[20px] p-4 sm:p-6 md:p-8 min-h-[480px] md:min-h-[520px]"
                            style={{
                                background: "#e8e3d3",
                                boxShadow:
                                    "inset 0 2px 6px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.2)",
                            }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={active.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 items-center h-full"
                                >
                                    {/* Image */}
                                    <div
                                        className="relative aspect-square w-full rounded-[16px] overflow-hidden shadow-lg"
                                        style={{
                                            boxShadow: `0 8px 24px ${active.color}55, 0 4px 10px rgba(0,0,0,0.25)`,
                                        }}
                                    >
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url('${active.imageSrc}')` }}
                                        />
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background: `linear-gradient(to top, ${active.color}30 0%, transparent 60%)`,
                                            }}
                                        />
                                    </div>

                                    {/* Text */}
                                    <div className="flex flex-col gap-4 md:gap-5">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div
                                                className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 flex items-center justify-center shadow-md overflow-hidden"
                                                style={{ border: `2px solid ${active.color}` }}
                                            >
                                                <img
                                                    src={active.iconSrc}
                                                    alt=""
                                                    className="w-8 h-8 md:w-10 md:h-10 object-contain"
                                                />
                                            </div>
                                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#1f1f1f] tracking-tight leading-[1.05]">
                                                {active.title}{" "}
                                                <span style={{ color: shade(active.color, 0.55) }}>
                                                    {active.titleAccent}
                                                </span>
                                            </h2>
                                        </div>

                                        <div
                                            className="flex flex-col gap-3 md:gap-4 [&_strong]:text-[var(--accent-strong)] [&_strong]:font-bold"
                                            style={{ ["--accent-strong" as any]: shade(active.color, 0.55) }}
                                        >
                                            {active.paragraphs.map((p, i) => (
                                                <p
                                                    key={i}
                                                    className={
                                                        i === 0
                                                            ? "text-base md:text-lg text-[#2d2d2d] font-medium leading-relaxed"
                                                            : "text-sm md:text-base text-[#4a4a4a] font-medium leading-relaxed"
                                                    }
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

                    {/* Eraser detail in bottom-right */}
                    <div className="absolute bottom-3 right-4 md:bottom-5 md:right-7 w-14 h-5 md:w-20 md:h-7 rounded-sm pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(180deg, #f5e6c8 0%, #e8d4a8 50%, #c89858 50%, #a67838 100%)",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
                        }}
                    />
                </div>
            </div>
        </section>
    );
}
