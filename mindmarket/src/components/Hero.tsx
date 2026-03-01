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

            {/* Capa de oscurecimiento */}
            <div className="absolute inset-0 bg-black/40 z-10" />

            {/* Contenido Frontal */}
            <div className="relative z-20 text-center text-white px-4 flex flex-col items-center">

                {/* Entrance Animation Wrapper for Title */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    {/* Floating Animation for Title */}
                    <motion.h1
                        animate={{ y: [0, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="font-neue-machina text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight text-white m-0"
                    >
                        Craft your English skills
                    </motion.h1>
                </motion.div>

                {/* Entrance Animation Wrapper for Subtitle */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                >
                    {/* Floating Animation for Subtitle */}
                    <motion.p
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                        className="font-roboto text-lg md:text-2xl max-w-2xl mt-6 font-light text-gray-200"
                    >
                        Domina el idioma mientras exploras, construyes y colaboras en servidores globales.
                    </motion.p>
                </motion.div>

                {/* Entrance Animation Wrapper for CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                    className="mt-10"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-[#8ed462] text-[#1d1d1b] font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                        ¡Agenda tu Clase!
                    </motion.button>
                </motion.div>

            </div>
        </div>
    );
}
