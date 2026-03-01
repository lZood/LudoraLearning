"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

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
        <div ref={containerRef} className="relative h-[200vh] bg-[#8ed462] w-full">
            {/* Sticky Container */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">

                {/* Layer 1: Hero Text (z-10) */}
                <motion.div
                    className="absolute inset-x-0 top-0 pt-32 md:pt-48 px-4 flex flex-col items-center text-center max-w-7xl mx-auto z-10"
                    style={{
                        scale: textScale,
                        opacity: textOpacity,
                        y: textY,
                        willChange: "transform, opacity"
                    }}
                >
                    <h1 className="text-[#1d1d1b] font-bold text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-[0.9] mb-8 lg:mb-12">
                        Craft Your <br className="hidden md:block" /> English Skills!
                    </h1>
                    <p className="text-[#1d1d1b] text-lg sm:text-xl md:text-2xl font-medium max-w-2xl leading-relaxed opacity-90">
                        Clases de inglés que se desarrollan dentro de Minecraft, <br className="hidden sm:block" />
                        convirtiendo el juego en una experiencia educativa real.
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
                    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 translate-y-4">
                        <img
                            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80"
                            alt="People Animation Placeholder"
                            className="w-full h-auto object-bottom rounded-t-3xl shadow-2xl bg-black/5"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
