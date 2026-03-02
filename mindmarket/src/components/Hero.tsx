"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
            {/* Capa Base: Video de Fondo */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0"
                src="/videos/Clip De Minecraft.webp"
            />

            {/* Contenido Frontal */}
            <div className="relative z-20 flex flex-col items-start justify-center h-full w-full max-w-7xl mx-auto px-8 md:px-16 text-left">

                {/* Animation Wrapper de Entrada para el Título */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    {/* Efecto Flotante Continuo para el Título */}
                    <motion.h1
                        animate={{ y: [0, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight text-white mb-0"
                        style={{
                            fontFamily: 'var(--font-neue-machina), sans-serif',
                            textShadow: '4px 4px 10px rgba(0,0,0,0.8), -2px -2px 6px rgba(255,255,255,0.2)'
                        }}
                    >
                        Craft your English skills
                    </motion.h1>
                </motion.div>

                {/* Animation Wrapper de Entrada para el Subtítulo */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                >
                    {/* Efecto Flotante Continuo (desfasado) para el Subtítulo */}
                    <motion.p
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                        className="text-lg md:text-2xl max-w-2xl mt-6 text-white"
                        style={{
                            fontFamily: 'var(--font-roboto), sans-serif',
                            textShadow: '2px 2px 8px rgba(0,0,0,0.9)'
                        }}
                    >
                        Clases de inglés que se desarrollan dentro de Minecraft, <br className="hidden md:block" /> convirtiendo el juego en una experiencia educativa real.
                    </motion.p>
                </motion.div>

            </div>
        </div>
    );
}
