"use client";

import React from "react";
import { motion } from "framer-motion";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import { ChevronDown } from "lucide-react";

const neueMachina = localFont({
    src: "../../../public/fonts/NeueMachina-Ultrabold.otf",
    display: "swap",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

export default function AboutHeroNew() {
    return (
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background image with overlay */}
            <div className="absolute inset-0">
                <img
                    src="/images/sobre-nosotros/team.webp"
                    alt=""
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#1a1a2e]" />
            </div>

            {/* Floating pixel particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-[#88e04f]/20"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 3 + i * 0.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.4,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
                {/* Chapter label */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`text-[#88e04f] text-sm tracking-[0.3em] uppercase mb-8 font-semibold ${montserrat.className}`}
                >
                    Nuestra historia
                </motion.div>

                {/* Main narrative */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.15 }}
                    className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-8 ${neueMachina.className}`}
                >
                    NACIMOS JUGANDO.
                    <br />
                    <span className="text-[#88e04f]">AHORA ENSEÑAMOS</span>
                    <br />
                    JUGANDO.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    className={`text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed ${montserrat.className}`}
                >
                    Todo empezó en un servidor de Minecraft entre amigos.
                    Hoy somos un equipo que transforma la forma de aprender inglés.
                </motion.p>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ChevronDown className="w-6 h-6 text-white/30" />
                </motion.div>
            </motion.div>
        </section>
    );
}
