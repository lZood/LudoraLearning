"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxImageProps {
    src: string;
    alt: string;
    height?: string; // e.g., "h-[60vh]" or "h-[800px]"
}

export default function ParallaxImage({ src, alt, height = "h-[60vh] md:h-[80vh]" }: ParallaxImageProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

    return (
        <section
            ref={containerRef}
            className={`relative w-full overflow-hidden rounded-t-[3rem] rounded-b-[3rem] my-12 z-0 ${height}`}
        >
            <motion.div
                style={{ y }}
                className="absolute inset-0 w-full h-[130%] -top-[15%] left-0 right-0 origin-center"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                />
            </motion.div>
        </section>
    );
}
