"use client";

import React from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

interface ScrollSnakeProps {
    containerRef?: React.RefObject<HTMLElement | null>;
}

export default function ScrollSnake({ containerRef }: ScrollSnakeProps) {
    // We track the scroll progress of the container section
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // MAPEAREMOS EL PROGRESO PARA "ADELANTAR" EL DIBUJO
    // Optimizamos para que después del 50% (0.5) del scroll real, 
    // la línea se dispare hacia adelante para no quedarse atrás.
    const acceleratedProgress = useTransform(
        scrollYProgress,
        [0, 0.4, 0.7, 1], // Puntos de control del scroll real
        [0, 0.4, 0.8, 1]  // Puntos de avance de la línea (acelerón fuerte después del 40%)
    );

    // Add a spring for extra smooth drawing
    const smoothProgress = useSpring(acceleratedProgress, {
        stiffness: 70, // Un poco más de rigidez para que reaccione más rápido
        damping: 25,
        restDelta: 0.001
    });

    return (
        <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
            <svg
                viewBox="0 0 100 1500"
                fill="none"
                preserveAspectRatio="none"
                className="w-full absolute top-0 left-0"
                style={{ height: "calc(100% + 1200px)" }}
            >
                <motion.path
                    d="
            M 50,0
            C 70,100 90,200 50,300
            C 10,400 10,600 50,700
            C 90,800 70,950 50,1100
            V 1600
          "
                    stroke="#8ed462"
                    strokeWidth="15"
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
