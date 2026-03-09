"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export default function ServicesDifference() {
    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.15, delayChildren: 0.1 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    return (
        <section className="relative w-full min-h-screen bg-white rounded-[50px] overflow-hidden flex flex-col items-center justify-center px-6 py-24 md:py-32">

            <div className="relative z-10 max-w-7xl mx-auto w-full">

                {/* Header (Inspired by Estrategia page) */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="flex flex-col items-center gap-8 mb-16 md:mb-24"
                >
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left shadow-sm bg-white p-4 pr-8 rounded-full border border-gray-100">
                        {/* Big Icon */}
                        <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border-4 border-[#632EB0]/20 flex items-center justify-center shadow-md overflow-hidden">
                            <img
                                src="/images/service-page/swords.webp"
                                alt="Icono"
                                className="w-10 h-10 md:w-14 md:h-14 object-contain"
                            />
                        </div>

                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#222222] tracking-tight leading-[1.1]">
                            Clásico vs <span className="text-[#632EB0]">Ludora</span>
                        </h2>
                    </motion.div>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full h-full lg:min-h-[500px]">

                    {/* Traditional Method - "Vanilla/Stone" feel but clean */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
                        className="flex-1 bg-[#fdfaf5] rounded-[40px] p-8 md:p-12 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border-2 border-gray-100 relative flex flex-col items-center text-center lg:items-start lg:text-left"
                    >
                        {/* Title & Icon Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gray-200 border-2 border-gray-300 flex items-center justify-center p-2 shadow-inner">
                                {/* Using a generic book for classic */}
                                <img src="/images/estrategia-page/book.webp" alt="Libro" className="w-full h-full object-contain grayscale opacity-60" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-500">Tradicional</h3>
                        </div>

                        <div className="flex flex-col gap-6 w-full">
                            {[
                                "Libros de texto aburridos y repetitivos.",
                                "Memorización pasiva y poca participación.",
                                "Poca práctica oral y miedo a equivocarse.",
                                "Enfoque solo en pasar el examen."
                            ].map((text, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-gray-100 shadow-sm">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1">
                                        <img src="/images/service-page/angrybad.webp" alt="Bad" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-gray-500 font-medium leading-relaxed text-lg pt-1">{text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Ludora Method - "Emerald/Diamond" feel, vibrant */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
                        className="flex-1 bg-gradient-to-br from-[#10b981]/10 to-[#047857]/5 rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(16,185,129,0.15)] border-2 border-[#10b981]/30 relative z-10 lg:scale-[1.02] flex flex-col items-center text-center lg:items-start lg:text-left"
                    >
                        <div className="absolute top-0 right-10 transform -translate-y-1/2 z-20 hidden md:block">
                            <div className="bg-[#f59e0b] text-white px-6 py-2 rounded-full font-black uppercase tracking-widest border-2 border-white shadow-[0_10px_20px_rgba(245,158,11,0.3)] text-sm rotate-3">
                                Nuestro Método ⭐
                            </div>
                        </div>

                        {/* Title & Icon Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-xl bg-white border-2 border-[#10b981] flex items-center justify-center p-2 shadow-lg drop-shadow-md">
                                <img src="/images/service-page/logoludoraredondo.webp" alt="logo ludora" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="text-4xl font-black text-[#632EB0]">Ludora Learning</h3>
                        </div>

                        <div className="flex flex-col gap-6 w-full">
                            {[
                                "Aprendizaje natural en entornos interactivos.",
                                "Inmersión al 100% en inglés con maestros reales.",
                                "Misiones y proyectos que refuerzan vocabulario.",
                                "Se pierde el miedo a hablar al estar en ambiente seguro."
                            ].map((text, i) => (
                                <div key={i} className="flex items-start gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl border-l-[6px] border-[#10b981] shadow-sm hover:shadow-md hover:bg-white transition-all">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 scale-125">
                                        <img src="/images/service-page/greenparticle.webp" alt="Success" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-[#222222] font-semibold leading-relaxed text-lg pt-1">{text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
