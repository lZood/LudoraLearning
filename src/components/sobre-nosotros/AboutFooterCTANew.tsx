"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Gamepad2, Users, Globe } from "lucide-react";
import Link from "next/link";
import localFont from "next/font/local";
import { WigglyUnderline } from "../WigglyUnderline";

const neueMachina = localFont({
    src: "../../../public/fonts/NeueMachina-Ultrabold.otf",
    display: "swap",
});

const PixelCloud = ({ className, delay = 0, opacity = 0.1 }: { className: string; delay?: number; opacity?: number }) => (
    <motion.svg
        width="120"
        height="80"
        viewBox="0 0 120 80"
        fill="currentColor"
        className={`absolute text-[#632eaf] ${className}`}
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

const perks = [
    {
        icon: <Gamepad2 className="w-6 h-6 text-[#632eaf]" />,
        title: "Enseña dentro de Minecraft",
        description: "Usa el juego como herramienta pedagógica real, no solo como gancho.",
    },
    {
        icon: <Users className="w-6 h-6 text-[#632eaf]" />,
        title: "Comunidad de profesores",
        description: "Colabora con un equipo apasionado por la innovación educativa.",
    },
    {
        icon: <Globe className="w-6 h-6 text-[#632eaf]" />,
        title: "Trabaja 100% remoto",
        description: "Conecta con alumnos de todo el mundo desde donde estés.",
    },
];

export default function AboutFooterCTANew() {
    return (
        <section className="relative w-full min-h-screen bg-[#1a1a2e] rounded-[50px] overflow-hidden flex items-center justify-center px-6 py-28 md:py-36">

            {/* Background decorations */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <PixelCloud className="top-[15%] left-[10%] scale-150 rotate-[-10deg]" delay={0} opacity={0.08} />
                <PixelCloud className="bottom-[20%] right-[10%] scale-[2] rotate-[5deg]" delay={1.5} opacity={0.06} />
                <PixelCloud className="top-[40%] right-[5%] scale-100" delay={0.8} opacity={0.1} />
                <PixelCloud className="bottom-[30%] left-[5%] scale-125 rotate-[15deg]" delay={2} opacity={0.05} />
                <motion.div className="absolute top-[25%] right-[25%] w-8 h-8 bg-[#632eaf]/15" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <motion.div className="absolute top-[60%] left-[20%] w-12 h-12 bg-[#632eaf]/10" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} />

                {/* Gradient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#632eaf]/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                className="relative z-10 max-w-5xl mx-auto text-center"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 bg-[#632eaf]/20 border border-[#632eaf]/30 text-[#b794f6] px-5 py-2.5 rounded-full text-sm font-bold mb-8"
                >
                    <span className="w-2.5 h-2.5 bg-[#88e04f] rounded-full animate-pulse" />
                    Estamos contratando
                </motion.div>

                {/* Title */}
                <h2 className={`text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6 ${neueMachina.className}`}>
                    ENSEÑA INGLÉS <br />
                    DE UNA FORMA{" "}
                    <span className="inline-block">
                        <WigglyUnderline color="#88e04f" thickness="12px" className="px-2">
                            ÉPICA
                        </WigglyUnderline>
                    </span>
                </h2>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 }}
                    className="text-gray-300 text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto mb-16"
                >
                    Buscamos maestros de inglés que quieran revolucionar la educación. Si te apasiona enseñar y los videojuegos, este es tu lugar.
                </motion.p>

                {/* Perks grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {perks.map((perk, index) => (
                        <motion.div
                            key={perk.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-[24px] p-8 text-left"
                        >
                            <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                {perk.icon}
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">{perk.title}</h3>
                            <p className="text-gray-400 text-base leading-relaxed">{perk.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="flex justify-center">
                    <Link
                        href="/contacto"
                        className="group flex items-center justify-center relative rounded-xl bg-[#632eaf] shadow-[0_10px_30px_0_rgba(99,46,175,0.4)] hover:shadow-[0_15px_40px_rgba(99,46,175,0.5)] hover:-translate-y-1 hover:scale-105 active:translate-y-1 transition-all duration-300 overflow-hidden"
                        style={{ width: '340px', height: '64px' }}
                    >
                        <div className="absolute left-2 bg-[#88e04f] rounded-full w-12 h-12 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                            <ChevronRight className="w-6 h-6 text-[#1d1d1b]" strokeWidth={3} />
                        </div>

                        <span className="font-bold text-white text-xl transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] group-hover:translate-x-[24px]">
                            Únete al equipo
                        </span>

                        <div className="absolute right-2 bg-[#88e04f] rounded-full w-12 h-12 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-100 opacity-100 group-hover:scale-0 group-hover:opacity-0">
                            <ChevronRight className="w-6 h-6 text-[#1d1d1b]" strokeWidth={3} />
                        </div>
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
