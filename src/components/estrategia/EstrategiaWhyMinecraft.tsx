"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { WigglyUnderline } from "../WigglyUnderline";

// Helper component for a pixelated cloud/cluster
const PixelCloud = ({ className, delay = 0, opacity = 0.1 }: { className: string, delay?: number, opacity?: number }) => (
    <motion.svg
        width="120"
        height="80"
        viewBox="0 0 120 80"
        fill="currentColor"
        className={`absolute text-white ${className}`}
        style={{ opacity }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    >
        <rect x="20" y="40" width="20" height="20" />
        <rect x="40" y="20" width="20" height="20" />
        <rect x="40" y="40" width="40" height="20" />
        <rect x="60" y="20" width="20" height="20" />
        <rect x="80" y="40" width="20" height="20" />
        <rect x="40" y="60" width="40" height="20" />
    </motion.svg>
);

export default function EstrategiaWhyMinecraft() {
    return (
        <section className="relative w-full min-h-screen bg-[#88e04f] rounded-[50px] overflow-hidden flex items-center justify-center px-6 py-28 md:py-36">

            {/* Blocky Background Decorations */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <PixelCloud className="top-[15%] left-[10%] scale-150 rotate-[-10deg]" delay={0} opacity={0.15} />
                <PixelCloud className="bottom-[20%] right-[10%] scale-[2] rotate-[5deg]" delay={1.5} opacity={0.1} />
                <PixelCloud className="top-[40%] right-[5%] scale-100" delay={0.8} opacity={0.2} />
                <PixelCloud className="bottom-[30%] left-[5%] scale-125 rotate-[15deg]" delay={2} />

                {/* Decorative loose pixels */}
                <motion.div className="absolute top-[25%] right-[25%] w-8 h-8 bg-white/20" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <motion.div className="absolute top-[60%] left-[20%] w-12 h-12 bg-white/10" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} />
                <motion.div className="absolute bottom-[10%] left-[40%] w-6 h-6 bg-white/20" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                className="relative z-10 max-w-5xl mx-auto text-center"
            >
                <div className="flex items-center justify-center gap-4 mb-8">
                    <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-[#1d1d1b] tracking-tight leading-[1.1]">
                        ¿Por qué{" "}
                        <WigglyUnderline color="#ffffff" thickness="12px" className="px-2">
                            Minecraft?
                        </WigglyUnderline>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14 text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                        className="bg-white/20 border border-white/30 backdrop-blur-md rounded-[24px] p-8 shadow-sm"
                    >
                        <p className="text-[#1d1d1b] text-lg md:text-xl font-medium leading-relaxed">
                            Minecraft es el aula perfecta porque fomenta la <strong className="text-white drop-shadow-sm font-bold">creatividad sin límites</strong>. Es un entorno donde el inglés deja de ser una materia y se convierte en la "llave" para abrir cofres, completar misiones y colaborar en equipo.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25 }}
                        className="bg-white/20 border border-white/30 backdrop-blur-md rounded-[24px] p-8 shadow-sm"
                    >
                        <p className="text-[#1d1d1b] text-lg md:text-xl font-medium leading-relaxed">
                            La <strong className="text-white drop-shadow-sm font-bold">alta motivación del juego</strong> mantiene a los alumnos enganchados y participando activamente, transformando cada sesión en una experiencia social y memorable que realmente disfrutan.
                        </p>
                    </motion.div>
                </div>

                <div className="flex justify-center">
                    <Link
                        href="/contacto"
                        className="group flex items-center relative rounded-xl bg-white shadow-xl overflow-hidden"
                        style={{ width: '360px', height: '64px' }}
                    >
                        {/* Icono a la izquierda (escala 0 por defecto) */}
                        <div className="absolute left-2 bg-[#8ed462] rounded-full w-12 h-12 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                            <ChevronRight className="w-6 h-6 text-[#1d1d1b]" strokeWidth={3} />
                        </div>

                        {/* Texto centrado visualmente hacia la izquierda por defecto */}
                        <span className="absolute left-8 font-semibold text-[#1d1d1b] text-xl transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] group-hover:translate-x-[48px]">
                            Agenda tu clase de prueba
                        </span>

                        {/* Icono a la derecha por defecto (escala 100 por defecto) */}
                        <div className="absolute right-2 bg-[#88e04f] rounded-full w-12 h-12 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-100 opacity-100 group-hover:scale-0 group-hover:opacity-0">
                            <ChevronRight className="w-6 h-6 text-[#1d1d1b]" strokeWidth={3} />
                        </div>
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
