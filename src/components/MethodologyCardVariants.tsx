"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Roboto } from "next/font/google";
import { WigglyUnderline } from "./WigglyUnderline";

const roboto = Roboto({
    weight: ["400", "700"],
    subsets: ["latin"],
    display: "swap",
});

const methodologyCards = [
    {
        id: "play",
        title: "Aprende jugando",
        description: "Practica inglés in-game con actividades y misiones diseñadas para que uses el idioma de forma real.",
        image: "/images/home/methodology_01.webp",
        accent: "#2bb8f2",
        panel: "#106f93",
    },
    {
        id: "pace",
        title: "Tú marcas el paso",
        description:
            "Refuerza lo aprendido con videos, ejercicios interactivos y contenido diseñado para avanzar paso a paso, todo dentro de nuestro portal de alumnos.",
        image: "/images/home/methodology_02.webp",
        accent: "#7340d7",
        panel: "#3d1d79",
    },
    {
        id: "connect",
        title: "Conecta y aplica",
        description:
            "Todo lo que aprendes en la plataforma lo usas dentro del juego, creando una experiencia práctica y completa.",
        image: "/images/home/methodology_03.png",
        accent: "#ff705d",
        panel: "#a73b2e",
    },
];

type Slot = "left" | "center" | "right";

function getSlot(index: number, activeIndex: number, total: number): Slot {
    const offset = (index - activeIndex + total) % total;
    if (offset === 0) return "center";
    if (offset === 1) return "right";
    return "left";
}

function MethodologyCard({
    card,
    slot,
    onClick,
}: {
    card: (typeof methodologyCards)[0];
    slot: Slot;
    onClick: () => void;
}) {
    const [isFlipped, setIsFlipped] = useState(false);
    const isCenter = slot === "center";

    const slotStyles = {
        center: {
            x: "0%",
            scale: 1,
            opacity: 1,
            rotate: 0,
            zIndex: 30,
        },
        left: {
            x: "-66%",
            scale: 0.88,
            opacity: 1,
            rotate: -5,
            zIndex: 10,
        },
        right: {
            x: "66%",
            scale: 0.88,
            opacity: 1,
            rotate: 5,
            zIndex: 10,
        },
    } as const;

    return (
        <motion.button
            type="button"
            className="absolute left-1/2 top-0 aspect-square w-[86vw] max-w-[520px] -translate-x-1/2 text-left [perspective:1800px]"
            style={{ zIndex: slotStyles[slot].zIndex }}
            animate={slotStyles[slot]}
            transition={{
                x: { type: "spring", stiffness: 220, damping: 26 },
                scale: { type: "spring", stiffness: 220, damping: 24 },
                rotate: { type: "spring", stiffness: 200, damping: 24 },
                opacity: { duration: 0.3 },
            }}
            onClick={() => {
                if (!isCenter) {
                    setIsFlipped(false);
                    onClick();
                    return;
                }
                setIsFlipped((value) => !value);
            }}
            onMouseEnter={() => {
                if (isCenter) setIsFlipped(true);
            }}
            onMouseLeave={() => {
                if (isCenter) setIsFlipped(false);
            }}
            whileHover={!isCenter ? { scale: 0.91 } : { scale: 1.02 }}
            aria-label={isCenter ? `${card.title}, carta activa` : `Traer ${card.title} al centro`}
        >
            <motion.div
                animate={{ rotateY: isCenter && isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative h-full w-full rounded-[36px] [transform-style:preserve-3d]"
            >
                <div
                    className="absolute inset-0 overflow-hidden rounded-[36px] bg-[#0b1d2a] shadow-[0_34px_70px_-26px_rgba(0,0,0,0.4)] [backface-visibility:hidden]"
                    style={{
                        backgroundImage: `url(${card.image})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                    }}
                >
                    {/* Bottom gradient — always present for text legibility */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
                        }}
                    />
                    {/* Dark overlay that fades in/out based on focus */}
                    <motion.div
                        className="pointer-events-none absolute inset-0 bg-black"
                        animate={{ opacity: isCenter ? 0 : 0.45 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8">
                        <div className="max-w-[14rem] md:max-w-xs">
                            <h4 className="text-3xl font-bold leading-none text-white md:text-4xl">{card.title}</h4>
                        </div>
                    </div>
                </div>

                <div
                    className="absolute inset-0 rounded-[36px] p-6 text-white shadow-[0_34px_70px_-26px_rgba(0,0,0,0.4)] [backface-visibility:hidden] [transform:rotateY(180deg)] md:p-8"
                    style={{ background: `linear-gradient(145deg, ${card.accent}, ${card.panel})` }}
                >
                    <div className="flex h-full flex-col justify-end">
                        <div>
                            <h4 className="text-3xl font-bold md:text-4xl">{card.title}</h4>
                            <p className={`mt-4 text-lg leading-relaxed text-white/92 ${roboto.className}`}>
                                {card.description}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.button>
    );
}

export default function MethodologyCardVariants() {
    const [activeIndex, setActiveIndex] = useState(0);
    const total = methodologyCards.length;

    const goPrev = () => setActiveIndex((value) => (value - 1 + total) % total);
    const goNext = () => setActiveIndex((value) => (value + 1) % total);

    return (
        <section className="relative overflow-hidden rounded-[48px] bg-[#88e04f] px-6 py-16 text-[#1d1d1b] md:px-10 md:py-20">
            <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-12">
                <div className="max-w-4xl text-center">
                    <h2 className="text-5xl font-bold tracking-tight leading-tight md:text-6xl lg:text-7xl">
                        Aprende a tu propio{" "}
                        <WigglyUnderline color="#ffffff" speed="2.5s" thickness="12px" scaleX="2">
                            ritmo
                        </WigglyUnderline>
                    </h2>
                    <p className={`mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-[#35552f] md:text-2xl ${roboto.className}`}>
                        Aprende inglés a tu ritmo combinando práctica en Minecraft con contenido interactivo dentro de nuestra
                        plataforma. Cada bloque que colocas es una nueva palabra aprendida, y cada misión es un paso más hacia
                        la fluidez.
                    </p>
                </div>

                <div className="relative w-full">
                    <div className="relative mx-auto h-[430px] w-full max-w-[1480px] px-6 pb-24 md:h-[560px] md:px-16 md:pb-0">
                        {methodologyCards.map((card, index) => (
                            <MethodologyCard
                                key={card.id}
                                card={card}
                                slot={getSlot(index, activeIndex, total)}
                                onClick={() => setActiveIndex(index)}
                            />
                        ))}

                        <button
                            type="button"
                            onClick={goPrev}
                            className="absolute bottom-2 left-[calc(50%-72px)] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#1d1d1b] shadow-xl transition-colors duration-300 hover:shadow-2xl hover:bg-[#632eaf] hover:text-white md:bottom-auto md:left-4 md:top-1/2 md:h-14 md:w-14 md:-translate-y-1/2"
                            aria-label="Carta anterior"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={goNext}
                            className="absolute bottom-2 left-[calc(50%+18px)] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#1d1d1b] shadow-xl transition-colors duration-300 hover:shadow-2xl hover:bg-[#632eaf] hover:text-white md:bottom-auto md:left-auto md:right-4 md:top-1/2 md:h-14 md:w-14 md:-translate-y-1/2"
                            aria-label="Carta siguiente"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
