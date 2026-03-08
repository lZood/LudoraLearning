"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, LayoutGrid, ChevronRight } from "lucide-react";
import Link from "next/link";

const AnimatedButton = ({ text, href }: { text: string; href: string }) => (
    <Link
        href={href}
        className="group flex items-center relative rounded-full bg-white shadow-sm overflow-hidden border border-gray-200 transition-shadow hover:shadow-md"
        style={{ width: '220px', height: '52px' }}
    >
        <div className="absolute left-1.5 bg-[#8ed462] rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100">
            <ChevronRight className="w-5 h-5 text-[#1d1d1b]" strokeWidth={3} />
        </div>

        <span className="w-full text-center font-semibold text-[#1a1a1a] text-[15px] transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] group-hover:translate-x-[16px]">
            {text}
        </span>

        <div className="absolute right-1.5 bg-[#88e04f] rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-100 opacity-100 group-hover:scale-0 group-hover:opacity-0">
            <ChevronRight className="w-5 h-5 text-[#1d1d1b]" strokeWidth={3} />
        </div>
    </Link>
);

export default function AboutInfoCards() {
    return (
        <section className="relative w-full bg-[#f5f1e4] py-24 px-4 sm:px-6 md:px-12">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-[#1a1a1a] mb-4 tracking-tight"
                    >
                        Sabemos exactamente cómo ayudarte a <br className="hidden md:block" />tener éxito
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 font-medium"
                    >
                        Porque sabemos que aprender inglés abre puertas al futuro.
                    </motion.p>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Top Row */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Mission Card (Wide) */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm flex-1 flex flex-col justify-between min-h-[380px] border border-gray-100 relative overflow-hidden"
                        >
                            <div className="relative z-10 max-w-xl">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-purple-50 rounded-2xl flex items-center justify-center shadow-sm">
                                        <Zap className="w-5 h-5 text-purple-600 fill-purple-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#1a1a1a]">Misión & visión</h3>
                                </div>
                                <p className="text-gray-600 leading-relaxed text-[17px] mb-12">
                                    Empoderamos a la próxima generación de creadores y soñadores de LATAM, haciendo que aprender inglés sea tan natural e inversivo como jugar a su videojuego favorito.
                                </p>
                            </div>
                            <div className="relative z-10">
                                <AnimatedButton text="Agenda tu clase!" href="/contacto" />
                            </div>
                        </motion.div>

                        {/* Top Right Image (Narrow) */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="w-full md:w-[340px] shrink-0 rounded-[2rem] overflow-hidden shadow-sm h-[380px]"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                                alt="Equipo de Ludora en evento"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Bottom Left Image (Narrow) */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="w-full md:w-[340px] shrink-0 rounded-[2rem] overflow-hidden shadow-sm h-[380px] order-2 md:order-1"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80"
                                alt="Equipo de Ludora trabajando"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>

                        {/* Story Card (Wide) */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm flex-1 flex flex-col justify-between min-h-[380px] border border-gray-100 relative overflow-hidden order-1 md:order-2"
                        >
                            <div className="relative z-10 max-w-2xl">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-purple-50 rounded-2xl flex items-center justify-center shadow-sm">
                                        <LayoutGrid className="w-5 h-5 text-purple-600 fill-purple-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#1a1a1a]">Nuestra Historia</h3>
                                </div>
                                <p className="text-gray-600 leading-relaxed text-[17px] mb-12">
                                    Nacimos de la observación de que la gramática tradicional no funciona para todos. Creemos que la inmersión interactiva a través del gaming, como Minecraft, es el puente al dominio fluido del idioma que los jóvenes necesitan hoy.
                                </p>
                            </div>
                            <div className="relative z-10">
                                <AnimatedButton text="Agenda tu clase!" href="/contacto" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
