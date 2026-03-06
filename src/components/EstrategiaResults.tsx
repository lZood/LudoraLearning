"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Trophy } from "lucide-react";

export default function EstrategiaResults() {
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
        <section className="relative w-full min-h-screen bg-[#fff0f0] rounded-[50px] overflow-hidden flex items-center px-6 py-24 md:py-32">
            <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                {/* Left — Visual Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.25 }}
                    className="relative aspect-square w-full rounded-[40px] overflow-hidden shadow-2xl order-1"
                >
                    {/* Background Image Placeholder */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/1_2.png')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    {/* Big Number */}
                    <span className="absolute bottom-6 right-10 text-[10rem] md:text-[14rem] font-black leading-none text-white/20 select-none">
                        05
                    </span>
                </motion.div>

                {/* Right — Content */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="flex flex-col gap-8 order-2"
                >
                    <motion.div variants={itemVariants} className="flex items-center gap-6">
                        {/* Big Icon */}
                        <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border-4 border-[#dc2626]/10 flex items-center justify-center shadow-lg">
                            <Trophy className="w-10 h-10 md:w-12 md:h-12 text-[#dc2626]" />
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#222222] tracking-tight leading-[1.1]">
                            Resultados <br />
                            <span className="text-[#dc2626]">del Método</span>
                        </h2>
                    </motion.div>

                    <div className="flex flex-col gap-6 max-w-xl">
                        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-[#444444] font-medium leading-relaxed">
                            Los resultados son duraderos porque <strong className="text-[#dc2626]">vinculamos el idioma con experiencias positivas</strong>.
                        </motion.p>
                        <motion.p variants={itemVariants} className="text-lg md:text-xl text-[#666666] font-medium leading-relaxed">
                            Al usar el inglés para superar retos, los alumnos retienen la información con mayor facilidad y ganan la confianza necesaria para comunicarse en situaciones reales.
                        </motion.p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
