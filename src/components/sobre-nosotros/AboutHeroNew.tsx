"use client";

import React from "react";
import { motion } from "framer-motion";
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

export default function AboutHeroNew() {
    return (
        <section className="relative w-full bg-white rounded-b-[50px] overflow-hidden pt-32 pb-24 px-4 sm:px-6 md:px-12 z-10 flex flex-col items-center justify-center min-h-screen">
            <div className="max-w-5xl mx-auto text-center w-full">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#1a1a1a] mb-6 tracking-tight ${neueMachina.className}`}
                >
                    HACIENDO EL APRENDIZAJE <br className="hidden sm:block" />MÁS SIMPLE PARA <span className="inline-block bg-[#8B5CF6] text-white px-6 py-2 rounded-full mt-2 sm:mt-0">ESTUDIANTES</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className={`text-lg sm:text-xl text-gray-600 mb-16 max-w-3xl mx-auto ${montserrat.className}`}
                >
                    En Ludora, estamos construyendo un ecosistema para que el aprendizaje de inglés con Minecraft sea fácil, divertido y sin fricciones.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="w-full relative rounded-[30px] overflow-hidden shadow-2xl aspect-[16/9] md:aspect-[21/9]"
                >
                    <img
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80"
                        alt="El equipo de Ludora"
                        className="object-cover w-full h-full"
                    />
                </motion.div>
            </div>
        </section>
    );
}
