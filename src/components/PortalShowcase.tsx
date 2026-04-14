"use client";

import React from "react";
import { motion } from "framer-motion";

const screenshots = [
    {
        src: "/images/home/cursos.png",
        title: "Cursos",
        rotate: -3,
        yOffset: "md:-translate-y-4",
    },
    {
        src: "/images/home/dashboard.png",
        title: "Dashboard",
        rotate: 0,
        yOffset: "md:translate-y-4",
    },
    {
        src: "/images/home/videos.png",
        title: "Videos",
        rotate: 3,
        yOffset: "md:-translate-y-4",
    },
];

export default function PortalShowcase() {
    return (
        <section className="relative w-full bg-[#632eaf] rounded-[50px] py-20 md:py-32 px-4 overflow-hidden z-10">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#88e04f]/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-[85vw] mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14 md:mb-20"
                >
                    <span className="text-[#88e04f] font-semibold lg:text-4xl tracking-widest uppercase mb-4 block">
                        Portal de Alumnos
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
                        Prepárate antes de jugar
                    </h2>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                        Nuestra plataforma te acompaña fuera del juego. Toma cursos, mira videos y evalúa tu progreso para llegar a cada clase listo para practicar.
                    </p>
                </motion.div>

                {/* Floating screenshots */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-4xl mx-auto">
                    {screenshots.map((shot, i) => (
                        <motion.div
                            key={shot.title}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.12, type: "spring", bounce: 0.3 }}
                            className={`md:${shot.yOffset} group`}
                        >
                            <div
                                className="bg-[#1a1a2e] rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-transform duration-500 group-hover:scale-[1.03] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                                style={{ transform: `rotate(${shot.rotate}deg)` }}
                            >
                                {/* Top bar image */}
                                <img
                                    src="/images/home/topbar.png"
                                    alt="Barra superior"
                                    className="w-full h-auto"
                                />

                                {/* Screenshot */}
                                <img
                                    src={shot.src}
                                    alt={`Portal de Alumnos — ${shot.title}`}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
