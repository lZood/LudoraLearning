"use client";

import React from "react";
import { motion } from "framer-motion";
import localFont from "next/font/local";

const neueMachina = localFont({
    src: "../../../public/fonts/NeueMachina-Ultrabold.otf",
    display: "swap",
});

export default function AboutFooterCTANew() {
    return (
        <section className="w-full bg-[#f5f1e4] py-32 px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center text-center">
            <div className="max-w-3xl mx-auto flex flex-col items-center">
                <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-purple-600 font-semibold mb-4 tracking-wider uppercase text-sm"
                >
                    Inicia tu aventura con Ludora
                </motion.span>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a1a] mb-6 tracking-tight ${neueMachina.className}`}
                >
                    Aprende inglés jugando <br className="hidden md:block" />y alcanza la fluidez hoy
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-600 mb-10 text-lg sm:text-xl font-medium"
                >
                    Empieza rápido, domina el idioma y diviértete con Ludora.
                </motion.p>

                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-purple-500/30 transition-all"
                >
                    Get started for free
                </motion.button>
            </div>
        </section>
    );
}
