"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import localFont from "next/font/local";
import { Roboto } from "next/font/google";

const neueMachina = localFont({
    src: "../../public/fonts/NeueMachina-Ultrabold.otf",
    display: "swap",
});

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    display: "swap",
});

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);

    // We track the scroll so that progress goes from 0 to 1 over the sticky period (100vh of scrolling)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Smooth out the progress with a spring for inertia
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 20,
        restDelta: 0.001
    });

    // Hero Text Animations: scale down and fade out
    const textScale = useTransform(smoothProgress, [0, 1], [1, 0.92]);
    const textOpacity = useTransform(smoothProgress, [0, 1], [1, 0.2]);
    const textY = useTransform(smoothProgress, [0, 1], [0, 50]);

    // Section 2 (White Sliding Background) Animation
    const section2Y = useTransform(smoothProgress, [0, 1], ["100%", "0%"]);

    return (
        <div ref={containerRef} className="relative h-[200vh] w-full">
            {/* Sticky Container */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">

                {/* Background Video (Layer 0) */}
                <video
                    src="/videos/Clip De Minecraft.webp"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* Layer 1: Hero Text (z-10) */}
                <motion.div
                    className="absolute inset-x-0 top-0 pt-32 md:pt-48 px-6 sm:px-12 md:px-24 flex flex-col items-start text-left max-w-[90vw] mx-auto z-10"
                    style={{
                        scale: textScale,
                        opacity: textOpacity,
                        y: textY,
                        willChange: "transform, opacity"
                    }}
                >
                    <h1
                        className={`text-[#ffffff] font-bold text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] xl:text-[9rem] tracking-[0.1em] leading-[0.9] mb-8 lg:mb-12 ${neueMachina.className}`}
                        style={{
                            filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.41)) drop-shadow(0px 15px 100px rgba(255, 255, 255, 0.53))"
                        }}
                    >
                        CRAFT YOUR <br className="hidden md:block" /> ENGLISH SKILLS!
                    </h1>
                    <p
                        className={`text-[#ffffff] text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium max-w-2xl leading-relaxed opacity-100 tracking-[0.08em] ${roboto.className}`}
                        style={{
                            textShadow: "0px 4px 4px rgba(0, 0, 0, 0.50)"
                        }}
                    >
                        Clases de inglés que se desarrollan dentro de Minecraft, convirtiendo el juego en una experiencia educativa real.
                    </p>
                </motion.div>

                {/* Layer 2: White Section 2 Sliding Background (z-20) */}
                <motion.div
                    className="absolute inset-x-0 bottom-0 h-screen bg-[#f5f1e4] rounded-t-[50px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] z-20"
                    style={{
                        y: section2Y,
                        willChange: "transform"
                    }}
                >
                    {/* We can add a subtle top padding here so content naturally flows, but the actual content can also be placed in the next section in page.tsx */}
                </motion.div>

                {/* Layer 3: Persistent People Graphic (z-30) */}
                <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-none" style={{ willChange: "transform" }}>
                    {/* We use translate-y to slightly adjust default position if needed, but it mostly stays at bottom */}

                </div>

            </div>
        </div>
    );
}
