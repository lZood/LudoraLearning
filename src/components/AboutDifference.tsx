"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

export default function AboutDifference() {
    return (
        <section className="relative w-full min-h-[90vh] bg-[#fdfaf5] rounded-[50px] overflow-hidden flex flex-col items-center justify-center px-6 py-28 md:py-36">
            <div className="relative z-10 max-w-6xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                    className="text-center mb-16 md:mb-24"
                >
                    <span className="inline-block bg-[#f59e0b]/15 text-[#d97706] px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-[0.15em] mb-6">
                        ✨ El Método Ludora
                    </span>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#222222] tracking-tight leading-[1.05]">
                        Marca la{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f59e0b] to-[#ea580c]">
                            diferencia
                        </span>
                    </h2>
                </motion.div>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-16 w-full">

                    {/* Traditional Method */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
                        className="flex-1 bg-white rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-2 border-red-50 relative"
                    >
                        <div className="absolute top-0 right-10 transform -translate-y-1/2">
                            <div className="bg-red-100 text-red-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border-2 border-white shadow-sm">
                                Clásico
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-gray-400 mb-8 border-b-2 border-gray-100 pb-6">Educación Tradicional</h3>

                        <ul className="space-y-6">
                            {[
                                "Memorización forzada de listas de vocabulario.",
                                "Gramática abstracta sin contexto real.",
                                "Miedo a equivocarse en voz alta.",
                                "Clases aburridas que se sienten como un castigo.",
                                "Progreso lento y frustrante."
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-1">
                                        <X size={14} strokeWidth={3} />
                                    </div>
                                    <span className="text-gray-500 font-medium leading-relaxed">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Ludora Method */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
                        className="flex-1 bg-gradient-to-br from-[#10b230] to-[#0a8a25] rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(16,178,48,0.2)] md:scale-105 relative z-10"
                    >
                        <div className="absolute top-0 right-10 transform -translate-y-1/2">
                            <div className="bg-[#f59e0b] text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg rotate-3">
                                Método Ludora ⭐
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-8 border-b-2 border-white/20 pb-6">La Revolución</h3>

                        <ul className="space-y-6">
                            {[
                                "Vocabulario absorbido naturalmente mientras juegan.",
                                "Gramática aplicada en tiempo real para sobrevivir y crear.",
                                "Entorno seguro donde el error es parte de la aventura.",
                                "Clases que son la parte favorita de su semana.",
                                "Fluidez real mediante inmersión conversacional 100% activa."
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5 backdrop-blur-sm border border-white/30">
                                        <Check size={18} strokeWidth={3} />
                                    </div>
                                    <span className="text-white/90 font-medium leading-relaxed text-lg">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
