"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

interface ScrollSnakeProps {
    containerRef?: React.RefObject<HTMLElement | null>;
}

export default function ScrollSnake({ containerRef }: ScrollSnakeProps) {
    // Replicamos el comportamiento "top top" y "bottom bottom" del ScrollTrigger del usuario
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Replicamos el "scrub: 1.5" (pequeñísimo retraso suavizado) usando un Spring
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 50,
        damping: 20,
        restDelta: 0.001
    });

    return (
        <div className="absolute inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
            <svg
                className="w-full absolute top-0 left-0 h-full"
                viewBox="0 0 1000 3000"
                preserveAspectRatio="xMidYMid meet"
                style={{ opacity: 0.8 }}
            >
                <motion.path
                    d="M 500 100 
                       C 500 400, 800 600, 800 900 
                       C 800 1200, 200 1400, 200 1700 
                       C 200 1900, 600 2000, 600 2200 
                       C 600 2400, 200 2450, 200 2250 
                       C 200 2050, 700 2050, 500 2600 
                       C 400 2800, 500 2900, 500 3000"
                    stroke="#88e04f"
                    strokeWidth="120"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        pathLength: smoothProgress,
                    }}
                />
            </svg>
        </div>
    );
}
