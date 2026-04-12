"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Swords, Gamepad2 } from "lucide-react";
import { WigglyUnderline } from "./WigglyUnderline";

const PixelCloud = ({ className, delay = 0, opacity = 0.1 }: { className: string; delay?: number; opacity?: number }) => (
    <motion.svg
        width="120"
        height="80"
        viewBox="0 0 120 80"
        fill="currentColor"
        className={`absolute text-white ${className}`}
        style={{ opacity }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    >
        <rect x="20" y="40" width="20" height="20" />
        <rect x="40" y="20" width="20" height="20" />
        <rect x="40" y="40" width="40" height="20" />
        <rect x="60" y="20" width="20" height="20" />
        <rect x="80" y="40" width="20" height="20" />
        <rect x="40" y="60" width="40" height="20" />
    </motion.svg>
);

interface CardData {
    number: string;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    videoSrc: string;
    accentColor: string;
}

const cards: CardData[] = [
    {
        number: "01",
        title: "Aprende",
        subtitle: "Domina las bases del idioma",
        description:
            "Recibe el input que necesitas para tu vida real mientras interactúas directamente con maestros certificados. Aprende de forma natural, con contenido útil y aplicado desde el primer día.",
        icon: <BookOpen className="w-5 h-5" />,
        videoSrc: "/videos/aprende.webp",
        accentColor: "#ff705d",
    },
    {
        number: "02",
        title: "Práctica",
        subtitle: "Usa el idioma en situaciones reales",
        description:
            "Refuerza lo aprendido dentro de Minecraft y la plataforma, comunicándote constantemente con tus compañeros y maestros en un entorno dinámico y divertido.",
        icon: <Swords className="w-5 h-5" />,
        videoSrc: "/videos/practica.webp",
        accentColor: "#2ba0ff",
    },
    {
        number: "03",
        title: "Juega",
        subtitle: "Vive la experiencia completa",
        description:
            "Vive la experiencia in-game: conoce personas, colabora, compite y enfréntate a nuevos retos mientras usas el inglés de forma natural.",
        icon: <Gamepad2 className="w-5 h-5" />,
        videoSrc: "/videos/juega.webp",
        accentColor: "#88e04f",
    },
];

const easeOut = [0.32, 0.72, 0, 1] as [number, number, number, number];

export default function ExpandableCards() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <section className="w-full bg-[#f5f1e4] pt-16 pb-20 px-4 sm:px-6 lg:px-8 rounded-b-[50px] relative z-10 overflow-hidden">
            {/* Floating pixel decorations */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <PixelCloud className="top-[10%] left-[8%] scale-150 rotate-[-10deg]" delay={0} opacity={0.15} />
                <PixelCloud className="bottom-[15%] right-[8%] scale-[2] rotate-[5deg]" delay={1.5} opacity={0.1} />
                <PixelCloud className="top-[50%] right-[5%] scale-100" delay={0.8} opacity={0.2} />
                <PixelCloud className="bottom-[25%] left-[5%] scale-125 rotate-[15deg]" delay={2} />
                <motion.div className="absolute top-[20%] right-[25%] w-8 h-8 bg-white/20" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <motion.div className="absolute top-[65%] left-[20%] w-12 h-12 bg-white/10" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} />
                <motion.div className="absolute bottom-[8%] left-[40%] w-6 h-6 bg-white/20" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
            </div>

            <div className="relative z-10">
                {/* Intro text */}
                <div className="max-w-4xl mx-auto text-center mb-10">
                    <h2 className="text-5xl md:text-7xl lg:text-6xl font-black mb-4 text-[#1a1a1a] tracking-tight leading-tight">
                        ¡Donde el Inglés se vive!
                    </h2>
                    <div className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
                        <p className="text-[#88e04f]">no se memoriza☝️🤓</p>
                    </div>
                    <p className="text-base md:text-lg text-[#1a1a1a]/80 mb-4 max-w-2xl mx-auto font-medium leading-relaxed">
                        Deja de intentar memorizar las reglas y comienza a usarlas. Desarrolla tu confianza al hablar mientras juegas, exploras y te comunicas dentro de Minecraft.
                    </p>
                </div>

                {/* Cards */}
                <div className="max-w-7xl mx-auto">
                    <div
                        className="flex flex-col md:flex-row gap-4 h-auto md:h-[500px]"
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {cards.map((card, index) => {
                            const isHovered = hoveredIndex === index;
                            const isAnyHovered = hoveredIndex !== null;
                            const isMinimized = isAnyHovered && !isHovered;

                            return (
                                <motion.div
                                    key={card.number}
                                    className="relative rounded-3xl overflow-hidden cursor-pointer"
                                    animate={{
                                        flex: isHovered ? 1.35 : isMinimized ? 1 : 1,
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        ease: easeOut,
                                    }}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    style={{ minHeight: "300px", minWidth: 0 }}
                                >
                                    {/* Video background */}
                                    <video
                                        className="absolute inset-0 w-full h-full object-cover"
                                        src={card.videoSrc}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="auto"
                                    />

                                    {/* Overlay */}
                                    <motion.div
                                        className="absolute inset-0"
                                        animate={{
                                            backgroundColor: isMinimized
                                                ? "rgba(0,0,0,0.5)"
                                                : isHovered
                                                    ? "rgba(0,0,0,0.15)"
                                                    : "rgba(0,0,0,0.2)",
                                        }}
                                        transition={{ duration: 0.4 }}
                                    />

                                    {/* Content */}
                                    <div className="relative z-10 h-full flex flex-col justify-between p-7">
                                        <div>
                                            <motion.h3
                                                className="font-black tracking-tight whitespace-nowrap"
                                                animate={{
                                                    fontSize: isHovered ? "2.75rem" : isMinimized ? "1.25rem" : "2rem",
                                                    color: isMinimized ? "rgba(255,255,255,0.4)" : card.accentColor,
                                                }}
                                                transition={{ duration: 0.5, ease: easeOut }}
                                            >
                                                {card.title}
                                            </motion.h3>
                                        </div>

                                        <div className="mt-auto">
                                            <motion.p
                                                className="leading-relaxed mb-3"
                                                animate={{
                                                    fontSize: isHovered ? "1rem" : isMinimized ? "0.75rem" : "0.9rem",
                                                    color: isMinimized ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,1)",
                                                }}
                                                transition={{ duration: 0.5, ease: easeOut }}
                                            >
                                                {card.description}
                                            </motion.p>

                                            <motion.p
                                                className="text-base font-bold"
                                                style={{ color: card.accentColor }}
                                                initial={false}
                                                animate={{
                                                    opacity: isHovered ? 1 : 0,
                                                    y: isHovered ? 0 : 12,
                                                }}
                                                transition={{ duration: 0.4, ease: easeOut }}
                                            >
                                                {card.subtitle}
                                            </motion.p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
