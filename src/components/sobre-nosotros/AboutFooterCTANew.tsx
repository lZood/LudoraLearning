"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import localFont from "next/font/local";
import { WigglyUnderline } from "../WigglyUnderline";

const neueMachina = localFont({
    src: "../../../public/fonts/NeueMachina-Ultrabold.otf",
    display: "swap",
});

// Helper component for a pixelated cloud/cluster
const PixelCloud = ({ className, delay = 0, opacity = 0.1 }: { className: string, delay?: number, opacity?: number }) => (
    <motion.svg
        width="120"
        height="80"
        viewBox="0 0 120 80"
        fill="currentColor"
        className={`absolute text-[#88e04f] ${className}`}
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

export default function AboutFooterCTANew() {
    return (
        <section className="relative w-full min-h-screen bg-[#edfade] rounded-[50px] overflow-hidden flex items-center justify-center px-6 py-28 md:py-36">

            {/* Blocky Background Decorations */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <PixelCloud className="top-[15%] left-[10%] scale-150 rotate-[-10deg]" delay={0} opacity={0.15} />
                <PixelCloud className="bottom-[20%] right-[10%] scale-[2] rotate-[5deg]" delay={1.5} opacity={0.1} />
                <PixelCloud className="top-[40%] right-[5%] scale-100" delay={0.8} opacity={0.2} />
                <PixelCloud className="bottom-[30%] left-[5%] scale-125 rotate-[15deg]" delay={2} />

                {/* Decorative loose pixels */}
                <motion.div className="absolute top-[25%] right-[25%] w-8 h-8 bg-[#88e04f]/20" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <motion.div className="absolute top-[60%] left-[20%] w-12 h-12 bg-[#88e04f]/10" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} />
                <motion.div className="absolute bottom-[10%] left-[40%] w-6 h-6 bg-[#88e04f]/20" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                className="relative z-10 max-w-5xl mx-auto text-center"
            >
                <div className="flex flex-col items-center justify-center gap-2 mb-10">

                    <h2 className={`text-4xl md:text-5xl lg:text-7xl font-bold text-[#1d1d1b] tracking-tight leading-[1.1] ${neueMachina.className}`}>
                        APRENDE JUGANDO <br />
                        Y ALCANZA LA FLUIDEZ{" "}
                        <span className="inline-block">
                            <WigglyUnderline color="#632eaf" thickness="12px" className="px-2">
                                HOY
                            </WigglyUnderline>
                        </span>
                    </h2>
                </div>

                <div className="flex justify-center mb-14 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                        className="bg-white/20 border border-white/30 backdrop-blur-md rounded-[24px] p-8 shadow-sm max-w-2xl px-12"
                    >
                        <p className="text-[#1d1d1b] text-xl md:text-2xl font-medium leading-relaxed">
                            Empieza rápido, domina el idioma y <strong className="text-[#632eaf] font-black">diviértete</strong> con Ludora.
                        </p>
                    </motion.div>
                </div>

                <div className="flex justify-center">
                    <Link
                        href="/contacto"
                        className="group flex items-center justify-center relative rounded-xl bg-white shadow-xl overflow-hidden"
                        style={{ width: '320px', height: '64px' }}
                    >
                        {/* Icono a la izquierda */}
                        <div className="absolute left-2 bg-[#8ed462] rounded-full w-12 h-12 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                            <ChevronRight className="w-6 h-6 text-[#1d1d1b]" strokeWidth={3} />
                        </div>

                        {/* Texto centrado visualmente */}
                        <span className="font-semibold text-[#1d1d1b] text-xl transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] group-hover:translate-x-[24px]">
                            ¡Agenda tu clase!
                        </span>

                        {/* Icono a la derecha por defecto */}
                        <div className="absolute right-2 bg-[#88e04f] rounded-full w-12 h-12 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-100 opacity-100 group-hover:scale-0 group-hover:opacity-0">
                            <ChevronRight className="w-6 h-6 text-[#1d1d1b]" strokeWidth={3} />
                        </div>
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
