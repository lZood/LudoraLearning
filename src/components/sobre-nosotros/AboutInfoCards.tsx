"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export default function AboutInfoCards() {
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
        <section className="relative w-full flex flex-col bg-[#f0ecff] rounded-[50px] overflow-hidden z-20 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">

            {/* Misión y Visión (Estilo Origin) */}
            <div className="relative w-full min-h-screen flex items-center px-6 py-24 md:py-32">
                <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left — Visual Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.25 }}
                        className="relative aspect-[3/4] w-full max-w-[280px] md:max-w-[320px] lg:max-w-[360px] mx-auto rounded-[40px] overflow-hidden shadow-2xl order-1"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: "url('/images/sobre-nosotros/mision.webp')" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
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
                            <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden border-4 border-[#f0ebf7]">
                                <img
                                    src="/images/sobre-nosotros/spyglass.webp"
                                    alt="Icono Misión"
                                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                                />
                            </div>

                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#222222] tracking-tight leading-[1.1]">
                                Misión <br />
                                <span className="text-[#88e04f]">& Visión</span>
                            </h2>
                        </motion.div>

                        <div className="flex flex-col gap-6 max-w-xl">
                            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-[#444444] font-medium leading-relaxed">
                                En Ludora queremos que los amantes de los videojuegos <strong className="text-[#88e04f]">fortalezcan su inglés</strong> dentro de un entorno que ya disfrutan: el juego.
                            </motion.p>
                            <motion.p variants={itemVariants} className="text-lg md:text-xl text-[#666666] font-medium leading-relaxed">
                                Inspirados por la creatividad que Minecraft ha despertado en nuestro equipo y en millones de jugadores, buscamos que nuestros alumnos aprendan el idioma de forma natural, sin la presión académica tradicional.
                            </motion.p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Nuestra Historia (Estilo Planning) */}
            <div className="relative w-full min-h-screen flex items-center px-6 py-24 md:py-32">
                <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left — Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        className="flex flex-col gap-8 order-2 lg:order-1"
                    >
                        <motion.div variants={itemVariants} className="flex items-center gap-6">
                            {/* Big Icon */}
                            <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden border-4 border-white/20">
                                <img
                                    src="/images/estrategia-page/book.webp"
                                    alt="Icono Historia"
                                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                                />
                            </div>

                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#222222] tracking-tight leading-[1.1]">
                                Nuestra <br />
                                <span className="text-[#56ccf2]">Historia</span>
                            </h2>
                        </motion.div>

                        <div className="flex flex-col gap-6 max-w-xl">
                            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-[#444444] font-medium leading-relaxed">
                                La historia de Ludora nace de algo que todo nuestro equipo comparte: haber <strong className="text-[#56ccf2]">desarrollado nuevas habilidades</strong> dentro de los videojuegos.
                            </motion.p>
                            <motion.p variants={itemVariants} className="text-lg md:text-xl text-[#666666] font-medium leading-relaxed">
                                Con el tiempo comenzamos a verlos como herramientas de aprendizaje. Queremos que más personas descubran que aprender inglés puede ser natural cuando te diviertes y convives con el idioma.
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* Right — Visual Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.25, delay: 0.1 }}
                        className="relative aspect-[3/4] w-full max-w-[280px] md:max-w-[320px] lg:max-w-[360px] mx-auto rounded-[40px] overflow-hidden shadow-2xl order-1 lg:order-2"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: "url('/images/sobre-nosotros/historia.webp')" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

