"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export default function EstrategiaPronunciation() {
    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.15, delayChildren: 0.1 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    return (
        <section className="relative w-full min-h-screen bg-[#e0f2fe] rounded-[50px] overflow-hidden flex items-center px-6 py-24 md:py-32">
            <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="flex flex-col gap-8 order-1"
                >
                    <motion.div variants={itemVariants} className="flex items-center gap-6">
                        {/* Big Icon */}
                        <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border-4 border-[#0284c7]/10 flex items-center justify-center shadow-lg overflow-hidden">
                            <img
                                src="/images/estrategia-page/Blue_Orchid_JE7_BE2.webp"
                                alt="Icono"
                                className="w-12 h-12 md:w-16 md:h-16 object-contain"
                            />
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#222222] tracking-tight leading-[1.1]">
                            Pronunciación <br />
                            <span className="text-[#0284c7]">Inteligente</span>
                        </h2>
                    </motion.div>

                    <div className="flex flex-col gap-6 max-w-xl">
                        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-[#444444] font-medium leading-relaxed">
                            No solo enseñamos vocabulario, también enseñamos cómo <strong className="text-[#0284c7]">suena realmente el inglés</strong>. Utilizamos herramientas de fonética y fonología diseñadas especialmente para hispanohablantes.
                        </motion.p>
                        <motion.p variants={itemVariants} className="text-lg md:text-xl text-[#666666] font-medium leading-relaxed">
                            Estas habilidades se practican dentro de Minecraft y con material especializado en el portal, incluyendo cuadros fonéticos y videos de articulación.
                        </motion.p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.25, delay: 0.1 }}
                    className="relative aspect-square w-full rounded-[40px] overflow-hidden shadow-2xl order-2"
                >
                    {/* Background Image Placeholder */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/estrategia-page/bakuMinecraft.webp')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>
            </div>
        </section>
    );
}
