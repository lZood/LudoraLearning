"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function FinalSection() {
    // Referencia al contenedor parallax para basar el scroll progresivo
    const sectionRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    // Layer 1 (Back): Slowest (e.g., distant mountains)
    const yBack = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    // Layer 2 (Mid): Medium speed (e.g., trees/buildings)
    const yMid = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

    // Layer 3 (Front): Fastest speed (e.g., immediate foreground rocks/bushes)
    const yFront = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);

    return (
        <>
            {/* Parte 1: El Parallax Multicapa */}
            <section
                ref={sectionRef}
                className="relative w-full h-[150vh] overflow-hidden"
            >
                {/* 
                  The Z-indexes here are critical to interleave with the ScrollSnake (which is z-10).
                  Back: z-0 -> Behind the snake
                  Mid/Front: z-20/z-30 -> In front of the snake
                */}

                {/* Layer 1 (Back) */}
                <motion.div
                    className="absolute bottom-0 left-0 w-full h-[60vh] bg-blue-100 opacity-50 z-0 flex items-end justify-center"
                    style={{ y: yBack }}
                >
                    <span className="text-4xl text-blue-300 font-bold mb-10">Montañas Lejanas (Placeholder)</span>
                </motion.div>

                {/* Layer 2 (Mid) */}
                <motion.div
                    className="absolute bottom-[-10vh] left-0 w-full h-[50vh] bg-green-200 opacity-70 z-20 flex items-end justify-center"
                    style={{ y: yMid }}
                >
                    <span className="text-4xl text-green-600 font-bold mb-20">Árboles (Placeholder)</span>
                </motion.div>

                {/* Layer 3 (Front) */}
                <motion.div
                    className="absolute bottom-[-20vh] left-0 w-full h-[40vh] bg-stone-300 z-30 flex items-end justify-center"
                    style={{ y: yFront }}
                >
                    <span className="text-4xl text-stone-600 font-bold mb-10">Tierra / Rocas (Placeholder)</span>
                </motion.div>
            </section>

            {/* Parte 2: La Sección CTA Final */}
            <section className="relative w-full min-h-screen bg-[#8ed462] flex flex-col items-center justify-center p-6 text-center z-40">
                <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold text-[#1d1d1b] tracking-tight mb-8">
                    ¡Listo para tu<br />próxima aventura!
                </h2>
                <p className="max-w-3xl text-xl md:text-2xl text-[#1d1d1b] leading-relaxed mb-12">
                    Ya sea que estés construyendo tu primer refugio o liderando clanes en servidores internacionales, estamos aquí para hacer que tu aprendizaje sea inmersivo, divertido y natural desde el primer bloque. Hablemos de tu próxima misión.
                </p>

                <Link
                    href="/contacto"
                    className="inline-flex items-center gap-4 rounded-xl pl-8 pr-2 py-3 transition-transform hover:scale-105 bg-white shadow-xl"
                >
                    <span className="font-semibold text-black text-xl">Comienza tu aventura</span>
                    <div className="bg-[#1d1d1b] rounded-full w-12 h-12 flex items-center justify-center">
                        <ChevronRight className="w-6 h-6 text-white" strokeWidth={3} />
                    </div>
                </Link>
            </section>
        </>
    );
}
