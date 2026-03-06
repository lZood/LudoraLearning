"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";

const neueMachina = localFont({
    src: "../../public/fonts/NeueMachina-Ultrabold.otf",
    display: "swap",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    display: "swap",
});

export interface ResponsiveSpan {
    mobile?: number;    // < 640px (Default: 4 cols)
    tablet?: number;    // 640px - 1024px (Default: 8 cols)
    desktop?: number;   // 1024px - 1536px (Default: 12 cols)
    ultrawide?: number; // > 1536px (Default: 16 cols)
}

export interface ResponsiveStart {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    ultrawide?: number;
}

export interface HeroLayout {
    titleSpan?: ResponsiveSpan;
    titleStart?: ResponsiveStart;
    subtitleSpan?: ResponsiveSpan;
    subtitleStart?: ResponsiveStart;
}

export interface HeroProps {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    mediaSrc?: string;
    isVideo?: boolean;
    layout?: HeroLayout;
    showGrid?: boolean;
    backgroundColor?: string;
    showOverlay?: boolean;
    titleColor?: string;
    subtitleColor?: string;
    showTextShadow?: boolean;
}

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';

function useBreakpoint() {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

    useEffect(() => {
        const updateBreakpoint = () => {
            const width = window.innerWidth;
            if (width < 640) setBreakpoint('mobile');
            else if (width < 1024) setBreakpoint('tablet');
            else if (width < 1536) setBreakpoint('desktop');
            else setBreakpoint('ultrawide');
        };

        updateBreakpoint();
        window.addEventListener('resize', updateBreakpoint);
        return () => window.removeEventListener('resize', updateBreakpoint);
    }, []);

    return breakpoint;
}

export default function Hero({
    title = (
        <>
            CRAFT YOUR <br className="hidden md:block" /> ENGLISH SKILLS!
        </>
    ),
    subtitle = "Clases de inglés que se desarrollan dentro de Minecraft, convirtiendo el juego en una experiencia educativa real.",
    mediaSrc = "/videos/clip-minecraft-3.webp",
    isVideo = true,
    layout = { // Default behavior
        titleSpan: { mobile: 4, tablet: 8, desktop: 14, ultrawide: 16 },
        titleStart: { mobile: 1, tablet: 1, desktop: 1, ultrawide: 1 },
        subtitleSpan: { mobile: 4, tablet: 6, desktop: 9, ultrawide: 11 },
        subtitleStart: { mobile: 1, tablet: 1, desktop: 1, ultrawide: 1 }
    },
    showGrid = false,
    backgroundColor,
    showOverlay = true,
    titleColor = "#ffffff",
    subtitleColor = "#ffffff",
    showTextShadow = true
}: HeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const bp = useBreakpoint();

    const getCols = () => {
        if (bp === 'mobile') return 4;
        if (bp === 'tablet') return 8;
        if (bp === 'ultrawide') return 16;
        return 14;
    };

    const getValue = (obj: any, currentBp: Breakpoint, defaultVal: number) => {
        if (!obj) return defaultVal;
        const order: Breakpoint[] = ['mobile', 'tablet', 'desktop', 'ultrawide'];
        const idx = order.indexOf(currentBp);
        for (let i = idx; i >= 0; i--) {
            if (obj[order[i]] !== undefined) return obj[order[i]];
        }
        return defaultVal;
    };

    const cols = getCols();
    const tSpan = getValue(layout.titleSpan, bp, cols);
    const tStart = getValue(layout.titleStart, bp, 1);
    const sSpan = getValue(layout.subtitleSpan, bp, cols);
    const sStart = getValue(layout.subtitleStart, bp, 1);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 20,
        restDelta: 0.001
    });

    const textScale = useTransform(smoothProgress, [0, 1], [1, 0.92]);
    const textOpacity = useTransform(smoothProgress, [0, 1], [1, 0.2]);
    const textY = useTransform(smoothProgress, [0, 1], [0, 50]);

    return (
        <div
            ref={containerRef}
            className="relative h-screen w-full overflow-hidden flex flex-col justify-between"
            style={{ backgroundColor: backgroundColor || 'black' }}
        >

            {/* Background Media (Layer 0) */}
            {mediaSrc && !backgroundColor && (
                isVideo ? (
                    <video
                        src={mediaSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
                    />
                ) : (
                    <img
                        src={mediaSrc}
                        alt="Hero background"
                        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
                    />
                )
            )}

            {/* Dark gradient overlay for better text readability */}
            {showOverlay && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/20 z-0" />
            )}

            <motion.div
                className="absolute inset-x-0 top-0 pt-32 md:pt-48 w-full max-w-[85vw] mx-auto z-10"
                style={{
                    scale: textScale,
                    opacity: textOpacity,
                    y: textY,
                    willChange: "transform, opacity"
                }}
            >
                {/* Grid Visualizer Overlay (Dev Mode) */}
                {showGrid && (
                    <div
                        className="absolute inset-0 grid gap-4 pointer-events-none z-[-1] opacity-50"
                        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                    >
                        {[...Array(cols)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-full border-x border-dashed border-white/20 ${i % 2 === 0 ? 'bg-white/10' : 'bg-[#8ED462]/20'}`}
                            >
                                <span className="text-[10px] text-white/40 p-1">{i + 1}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Grid Container: Reactive Columns */}
                <div
                    className="grid gap-4 w-full relative"
                    style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                >
                    {/* Title Wrapper with Container Query */}
                    <div
                        className="bg-transparent"
                        style={{
                            gridColumn: `${tStart} / span ${tSpan}`,
                            containerType: "inline-size"
                        }}
                    >
                        <div>
                            <h1
                                className={`font-bold tracking-[0.1em] leading-[0.9] mb-8 lg:mb-12 ${neueMachina.className}`}
                                style={{
                                    fontSize: "clamp(2rem, 9.8cqw, 9rem)",
                                    filter: showTextShadow
                                        ? "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.05)) drop-shadow(0px 15px 100px rgba(255, 255, 255, 0.53))"
                                        : "none",
                                    maxWidth: "100%",
                                    display: "inline-block",
                                    wordBreak: "keep-all",
                                    color: titleColor
                                }}
                            >
                                {title}
                            </h1>
                        </div>
                    </div>

                    {/* Subtitle Wrapper */}
                    <div
                        className="bg-transparent"
                        style={{
                            gridColumn: `${sStart} / span ${sSpan}`,
                        }}
                    >
                        <div>
                            <p
                                className={`font-medium leading-relaxed tracking-[0.08em] break-words ${montserrat.className}`}
                                style={{
                                    fontSize: "clamp(1.1rem, 2vw + 0.5rem, 2.5rem)",
                                    textShadow: showTextShadow ? "0px 4px 4px rgba(0, 0, 0, 0.10)" : "none",
                                    maxWidth: "100%",
                                    color: subtitleColor
                                }}
                            >
                                {subtitle}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
