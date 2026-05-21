"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
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

export interface HeroProps {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    mediaSrc?: string;
    isVideo?: boolean;
    showGrid?: boolean;
    backgroundColor?: string;
    showOverlay?: boolean;
    titleColor?: string;
    subtitleColor?: string;
    showTextShadow?: boolean;
    titleSize?: string;
    subtitleSize?: string;
    layout?: Record<string, unknown>;
}

/**
 * Measures the actual visible area of the hero and computes
 * font sizes as a percentage of that area. This reacts to:
 * - Browser zoom (changes clientWidth/clientHeight)
 * - Window resize
 * - Display scaling (125%, 150%, etc.)
 */
function useHeroSizes(containerRef: React.RefObject<HTMLDivElement | null>) {
    const [sizes, setSizes] = useState({ title: 72, subtitle: 20 });

    const calculate = useCallback(() => {
        if (!containerRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        const isMobile = w < 640;

        // Title: takes a larger share of width on mobile so it doesn't bottom out
        const byWidth = w * (isMobile ? 0.14 : 0.08);
        const byHeight = h * 0.13;
        const titlePx = Math.max(isMobile ? 44 : 36, Math.min(byWidth, byHeight, 120));

        // Subtitle: larger floor on mobile so it stays readable
        const subtitlePx = Math.max(isMobile ? 17 : 14, Math.min(titlePx * 0.3, h * 0.035, 28));

        setSizes({ title: titlePx, subtitle: subtitlePx });
    }, [containerRef]);

    useEffect(() => {
        calculate();

        const ro = new ResizeObserver(calculate);
        if (containerRef.current) ro.observe(containerRef.current);

        window.addEventListener("resize", calculate);
        // Also recalc on zoom — VisualViewport fires on zoom changes
        window.visualViewport?.addEventListener("resize", calculate);

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", calculate);
            window.visualViewport?.removeEventListener("resize", calculate);
        };
    }, [calculate, containerRef]);

    return sizes;
}

export default function Hero({
    title = (
        <>
            CRAFT YOUR <br className="hidden md:block" /> ENGLISH SKILLS!
        </>
    ),
    subtitle = "Enfocados en que hables inglés con seguridad, fluidez y naturalidad mientras juegas y aprendes en Minecraft.",
    mediaSrc = "/videos/clip-minecraft-3.webp",
    isVideo = true,
    showGrid = false,
    backgroundColor,
    showOverlay = true,
    titleColor = "#ffffff",
    subtitleColor = "#ffffff",
    showTextShadow = true,
    titleSize,
    subtitleSize,
}: HeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sizes = useHeroSizes(containerRef);

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
            className="relative h-screen w-full overflow-hidden"
            style={{ backgroundColor: backgroundColor || 'black' }}
        >
            {/* Background Media */}
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

            {/* Gradient overlay */}
            {showOverlay && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/20 z-0" />
            )}

            {/* Text Content — zones based on real container size */}
            <motion.div
                className="absolute inset-0 z-10 flex flex-col px-[4vw] sm:px-[7.5vw]"
                style={{
                    scale: textScale,
                    opacity: textOpacity,
                    y: textY,
                    willChange: "transform, opacity"
                }}
            >
                {/* Zone 1: Navbar spacer */}
                <div className="shrink-0 h-[20%] sm:h-[18%]" />

                {/* Zone 2: Title */}
                <div className="flex items-start overflow-hidden">
                    <h1
                        className={`font-bold tracking-[0.06em] sm:tracking-[0.1em] leading-[0.88] ${neueMachina.className}`}
                        style={{
                            fontSize: titleSize || `${sizes.title}px`,
                            filter: "none",
                            maxWidth: "90%",
                            wordBreak: "keep-all",
                            color: titleColor,
                            transition: "font-size 0.15s ease-out",
                        }}
                    >
                        {title}
                    </h1>
                </div>

                {/* Zone 3: Subtitle */}
                <div className="flex items-start pt-4 sm:pt-6 overflow-hidden">
                    <p
                        className={`font-medium leading-relaxed tracking-[0.04em] sm:tracking-[0.08em] break-words max-w-[90%] sm:max-w-[65%] ${montserrat.className}`}
                        style={{
                            fontSize: subtitleSize || `${sizes.subtitle}px`,
                            textShadow: showTextShadow ? "0px 4px 4px rgba(0, 0, 0, 0.10)" : "none",
                            color: subtitleColor,
                            transition: "font-size 0.15s ease-out",
                        }}
                    >
                        {subtitle}
                    </p>
                </div>

                {/* Zone 4: Bottom breathing room — ~16% (fills remaining) */}
                <div className="flex-1" />
            </motion.div>
        </div>
    );
}
