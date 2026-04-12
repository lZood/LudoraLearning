"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView, Variants } from "framer-motion";
import { BookOpen, MessagesSquare, Users } from "lucide-react";
import { Roboto } from "next/font/google";
import { WigglyUnderline } from "./WigglyUnderline";

const roboto = Roboto({
    weight: ["400", "700"],
    subsets: ["latin"],
    display: "swap",
});

const cards = [
    {
        title: "Aprende jugando",
        description: "Practica inglés in-game con actividades y misiones diseñadas para que uses el idioma de forma real.",
        icon: <BookOpen className="w-6 h-6 text-[#86d2fb]" />,
        bgColor: "bg-[#86d2fb]",
        textColor: "text-white",
        numberColor: "text-white",
        iconBg: "bg-white",
        bgImage: "/images/home/methodology_01.webp",
        xDir: -1,
    },
    {
        title: "Tú marcas el paso",
        description: "Refuerza lo aprendido con videos, ejercicios interactivos y contenido diseñado para avanzar paso a paso, todo dentro de nuestro portal de alumnos.",
        icon: <MessagesSquare className="w-6 h-6 text-[#632eaf]" />,
        bgColor: "bg-[#632eaf]",
        textColor: "text-white",
        numberColor: "text-white",
        iconBg: "bg-white",
        xDir: 1,
    },
    {
        title: "Conecta y aplica",
        description: "Todo lo que aprendes en la plataforma lo usas dentro del juego, creando una experiencia práctica y completa.",
        icon: <Users className="w-6 h-6 text-[#ff705d]" />,
        bgColor: "bg-[#ff705d]",
        textColor: "text-white",
        numberColor: "text-white",
        iconBg: "bg-white",
        xDir: -1,
    },
];

function AnimatedCard({
    card,
    index,
    isDesktop,
}: {
    card: (typeof cards)[0];
    index: number;
    isDesktop: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const isInView = useInView(ref, { once: true, margin: "-10% 0px -20% 0px" });

    useEffect(() => {
        if (isInView) {
            controls.start({ y: 0, x: 0, rotate: 0 });
        }
    }, [isInView, controls]);

    const xOffset = isDesktop ? card.xDir * 220 : 0;
    const initialRotate = isDesktop ? (card.xDir > 0 ? -10 : 10) : 0;

    return (
        <motion.div
            ref={ref}
            className="sticky w-full rounded-[40px] overflow-hidden origin-bottom"
            style={{
                top: `calc(100px + ${index * 75}px)`,
                zIndex: index,
            }}
            initial={{ y: 350, x: xOffset, rotate: initialRotate }}
            animate={controls}
            transition={{ duration: 1.6, type: "spring", bounce: 0.2 }}
        >
            <div
                className={`${card.bgColor} p-8 md:p-12 min-h-[60vh] md:min-h-[70vh] flex flex-col border border-black/5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]`}
                style={{
                    backgroundImage: card.bgImage ? `url(${card.bgImage})` : undefined,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                }}
            >
                <div className="flex-grow flex justify-between items-start w-full pt-0 pb-8 gap-4">
                    <span
                        className={`text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight ${card.numberColor} ${roboto.className}`}
                        style={{ textShadow: "4px 4px 20px rgba(0,0,0,0.2)" }}
                    >
                        {card.title}
                    </span>
                    <div className={`${card.iconBg} w-16 h-16 rounded-full flex items-center justify-center shrink-0`}>
                        {card.icon}
                    </div>
                </div>

                <div className="w-full pb-4">
                    <p className={`text-2xl md:text-3xl font-medium ${card.textColor} ${roboto.className}`}>
                        {card.description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

const generateSteppedPath = (width: number, height: number, layerBaseRatio: number, seedOffset: number) => {
    if (width === 0 || height === 0) return "";
    const blockSize = width < 768 ? 40 : 60;
    const cols = Math.ceil(width / blockSize);
    let path = `M0,${height} `;
    for (let i = 0; i < cols; i++) {
        const noise = Math.sin(i * 0.4 + seedOffset) * 2.0 + Math.sin(i * 0.7 + seedOffset * 2) * 1.5;
        const baseYPixels = height * layerBaseRatio;
        let y = Math.round((baseYPixels + noise * blockSize) / blockSize) * blockSize;
        if (y < blockSize) y = blockSize;
        if (y > height) y = height;
        path += `V${y} `;
        const x = Math.min((i + 1) * blockSize, width);
        path += `H${x} `;
    }
    path += `V${height} Z`;
    return path;
};

export default function BlockyMethodologyStack() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dim, setDim] = useState({ w: 0, h: 0 });
    const [isDesktop, setIsDesktop] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) setDim({ w: entry.contentRect.width, h: entry.contentRect.height });
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const checkSize = () => setIsDesktop(window.innerWidth >= 1024);
        checkSize();
        setHydrated(true);
        window.addEventListener("resize", checkSize);
        return () => window.removeEventListener("resize", checkSize);
    }, []);

    const containerVariants: Variants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } },
    };

    const layerVariants: Variants = {
        hidden: { y: dim.h ? dim.h : 500 },
        visible: {
            y: 0,
            transition: { type: "spring", stiffness: 120, damping: 20 },
        },
    };

    return (
        <>
            {/* Blocky Transition Wrapper — overflow-hidden ONLY here, NOT around the sticky section */}
            <div className="w-full relative overflow-hidden bg-transparent z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="relative"
                >
                    {/* Blocky Transition Layers */}
                    <div ref={containerRef} className="relative w-full h-[300px] md:h-[500px]">
                        <motion.svg variants={layerVariants} viewBox={`0 0 ${dim.w} ${dim.h}`} className="absolute bottom-0 w-full h-full z-0 block overflow-visible" fill="#1a3d12">
                            <path d={generateSteppedPath(dim.w, dim.h, 0.3, 0)} vectorEffect="non-scaling-stroke" />
                            {dim.h > 0 && <rect x="0" y={dim.h - 1} width={dim.w} height="2000" />}
                        </motion.svg>
                        <motion.svg variants={layerVariants} viewBox={`0 0 ${dim.w} ${dim.h}`} className="absolute bottom-0 w-full h-full z-0 block overflow-visible" fill="#2f6b21">
                            <path d={generateSteppedPath(dim.w, dim.h, 0.5, 13)} vectorEffect="non-scaling-stroke" />
                            {dim.h > 0 && <rect x="0" y={dim.h - 1} width={dim.w} height="2000" />}
                        </motion.svg>
                        <motion.svg variants={layerVariants} viewBox={`0 0 ${dim.w} ${dim.h}`} className="absolute bottom-0 w-full h-full z-0 block overflow-visible" fill="#56a83b">
                            <path d={generateSteppedPath(dim.w, dim.h, 0.65, 27)} vectorEffect="non-scaling-stroke" />
                            {dim.h > 0 && <rect x="0" y={dim.h - 1} width={dim.w} height="2000" />}
                        </motion.svg>
                    </div>

                    {/* Layer 4 — animates up, sits on top */}
                    <motion.div variants={layerVariants} className="w-full relative z-20 h-[300px] md:h-[500px] -mt-[300px] md:-mt-[500px] pointer-events-none">
                        <svg viewBox={`0 0 ${dim.w} ${dim.h}`} className="absolute bottom-0 w-full h-full block translate-y-[1px]" fill="#88e04f">
                            <path d={generateSteppedPath(dim.w, dim.h, 0.8, 42)} vectorEffect="non-scaling-stroke" />
                        </svg>
                    </motion.div>
                </motion.div>
            </div>

            {/* Methodology Section — sibling so sticky stacking works */}
            <section className="relative w-full bg-[#88e04f] text-[#1d1d1b] overflow-x-clip rounded-b-[50px] z-10">
                <div className="max-w-[85vw] mx-auto py-32 flex flex-col lg:flex-row gap-16 lg:gap-32 relative">
                    {/* Left Column - Sticky Text */}
                    <div className="w-full lg:w-1/2 lg:sticky lg:top-32 h-fit relative z-10">
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-8">
                            Aprende a tu propio{" "}
                            <WigglyUnderline color="#ffffff" speed="2.5s" thickness="12px" scaleX="2">
                                ritmo
                            </WigglyUnderline>
                        </h2>
                        <p className={`text-xl md:text-2xl leading-relaxed text-gray-700 max-w-xl ${roboto.className}`}>
                            Aprende inglés a tu ritmo combinando práctica en Minecraft con contenido interactivo dentro de nuestra plataforma. Cada bloque que colocas es una nueva palabra aprendida, y cada misión es un paso más hacia la fluidez.
                        </p>
                    </div>

                    {/* Right Column - Stacking Cards */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-[75px] relative z-20">
                        {hydrated && cards.map((card, index) => (
                            <AnimatedCard key={index} card={card} index={index} isDesktop={isDesktop} />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
