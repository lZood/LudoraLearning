"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Sparkles, Gamepad2, Blocks, MessageSquareQuote } from "lucide-react";

export default function MissionStatement() {
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
        <section className="relative w-full min-h-screen bg-[#e8e4d8] rounded-[50px] overflow-hidden flex items-center justify-center px-6 py-28 md:py-36">
            <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

                {/* Left Side: Sticky Title */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                    className="lg:col-span-5 lg:sticky lg:top-36 flex flex-col items-start"
                >
                    <span className="inline-flex items-center gap-2 bg-[#a855f7]/10 text-[#7c3aed] px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-[0.15em] mb-8">
                        <Sparkles className="w-4 h-4" />
                        Nuestra Historia
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-[#222222] tracking-tight leading-[1.05] mb-8">
                        Nació de una{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#7c3aed]">
                            idea simple
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-[#666666] font-medium leading-relaxed max-w-md">
                        Donde otros ven un videojuego, nosotros vemos un aula inmersiva. Ludora Learning es la metodología definitiva que fusiona la enseñanza del inglés con el infinito universo de Minecraft.
                    </p>
                </motion.div>

                {/* Right Side: Bento Box Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                    {/* Big Quote Box */}
                    <motion.div variants={itemVariants} className="sm:col-span-2 bg-[#7c3aed] rounded-[32px] p-8 md:p-12 shadow-xl relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[50px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
                        <MessageSquareQuote className="w-12 h-12 text-white/30 mb-6" />
                        <p className="text-2xl md:text-3xl text-white font-medium leading-relaxed">
                            <em className="font-serif">"¿Qué pasaría si los niños aprendieran inglés jugando lo que más les gusta?"</em>
                        </p>
                    </motion.div>

                    {/* Bento Box 1 */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 rounded-2xl bg-[#8ED462]/15 flex items-center justify-center text-[#4caf2e] mb-6">
                            <Blocks className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-black text-[#222222] mb-3">Vocabulario Aplicado</h3>
                        <p className="text-[#666666] font-medium leading-relaxed">
                            Cada bloque colocado y cada herramienta crafteada se convierte en vocabulario aprendido naturalmente.
                        </p>
                    </motion.div>

                    {/* Bento Box 2 */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 rounded-2xl bg-[#86d2fb]/15 flex items-center justify-center text-[#2a8ebd] mb-6">
                            <Gamepad2 className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-black text-[#222222] mb-3">Gramática en Acción</h3>
                        <p className="text-[#666666] font-medium leading-relaxed">
                            Misiones y aventuras diseñadas específicamente para internalizar estructuras gramaticales sin memorización.
                        </p>
                    </motion.div>

                </motion.div>
            </div>
        </section>
    );
}
