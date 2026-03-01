"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function MinecraftDiorama() {
    return (
        <section className="relative w-full h-[150vh] md:h-screen overflow-hidden flex items-center justify-center bg-[#f5f1e4]">
            {/* Capa 1: Fondo (z-0) */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/barebonesBackground.webp"
                    alt="Minecraft background"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>

            {/* Capa 1.5: Pescador (z-5) - Ahora detrás de la línea y más grande */}
            <div className="absolute z-[5] pointer-events-none bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[70%] max-w-[900px]">
                <Image
                    src="/images/Pescador.png"
                    alt="Pescador Background"
                    width={1000}
                    height={1000}
                    className="w-full h-auto drop-shadow-2xl"
                />
            </div>

            {/* Capa 2: La Culebrita flotante (z-10) */}
            {/* Animación de flotar (y: [0, -20, 0]) infinita, durando 4 segundos */}
            <motion.div
                className="absolute inset-0 z-10 w-full h-full pointer-events-none flex items-center justify-center"
                animate={{ y: [0, -20, 0] }}
                transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut",
                }}
            >
                {/* SVG serpenteante fijo, cruzando el centro */}
                <svg
                    viewBox="0 0 1000 500"
                    width="100%"
                    height="100%"
                    preserveAspectRatio="xMidYMid slice"
                    className="w-full h-full drop-shadow-xl"
                    style={{ minWidth: '1200px' }}
                >
                    <path
                        d="M -100 100 C 200 100, 300 400, 500 250 S 800 100, 1100 250"
                        fill="none"
                        stroke="#8ed462"
                        strokeWidth="15"
                        strokeLinecap="round"
                    />
                </svg>
            </motion.div>
        </section>
    );
}
