"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function ScrollSnake() {
    const svgRef = useRef<SVGSVGElement>(null);

    // We track the scroll progress of the entire window for the snake line
    const { scrollYProgress } = useScroll();

    // Add a spring for extra smooth drawing
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 50,
        damping: 20,
        restDelta: 0.001
    });

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden w-full h-full">
            {/* 
        The SVG needs to stretch to fill the height of the parent container 
        (which will be the main page).
        preserveAspectRatio="none" is key so you can draw a path from top to bottom
        without keeping the original aspect ratio of the viewBox.
      */}
            <svg
                ref={svgRef}
                viewBox="0 0 100 1000" // We use a tall viewBox grid
                fill="none"
                preserveAspectRatio="none"
                className="w-full h-full absolute top-0 left-0"
            >
                <motion.path
                    // Example snake path going down a long page
                    // Starts top middle, goes right, curves down left, curves down right, etc.
                    d="
            M 50,0
            C 70,100 90,200 50,300
            C 10,400 10,600 50,700
            C 90,800 70,950 50,1000
          "
                    stroke="#8ed462" // Darker/intense green for contrast against #f5f1e4
                    strokeWidth="10" // Al no usar non-scaling-stroke, este valor es un porcentaje del viewBox (2% del ancho).
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
