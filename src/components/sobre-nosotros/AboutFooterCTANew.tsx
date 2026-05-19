"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";

const neueMachina = localFont({
    src: "../../../public/fonts/NeueMachina-Ultrabold.otf",
    display: "swap",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

export default function AboutFooterCTANew() {
    return (
        <section className="relative w-full bg-[#f5f1e4] py-32 md:py-44 px-6 overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className={`text-[#8B5CF6] text-sm tracking-[0.3em] uppercase mb-8 font-semibold ${montserrat.className}`}
                >
                    Siguiente capítulo
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className={`text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a1a1a] tracking-tight leading-[1.05] mb-8 ${neueMachina.className}`}
                >
                    ¿QUIERES SER PARTE
                    <br />
                    DE ESTA HISTORIA?
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`text-lg md:text-xl text-[#666] leading-relaxed mb-14 max-w-xl mx-auto ${montserrat.className}`}
                >
                    Buscamos maestros, devs y creativos que quieran construir el futuro de la educación con nosotros. Si te apasionan los videojuegos y enseñar, hablemos.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        href="/contacto"
                        className="group inline-flex items-center gap-3 bg-[#1a1a2e] text-white font-bold text-lg px-10 py-5 rounded-2xl hover:shadow-[0_10px_40px_-10px_rgba(26,26,46,0.5)] hover:-translate-y-1 transition-all duration-300"
                    >
                        Únete al equipo
                        <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>

                    <Link
                        href="/contacto"
                        className={`inline-flex items-center gap-2 text-[#666] hover:text-[#1a1a1a] font-semibold text-lg px-6 py-5 transition-colors duration-300 ${montserrat.className}`}
                    >
                        O agenda una clase gratis
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
