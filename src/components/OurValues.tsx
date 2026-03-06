"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Users, Heart } from "lucide-react";

const values = [
    {
        icon: Gamepad2,
        title: "Aprender Jugando",
        desc: "La diversión es el motor más poderoso del aprendizaje. Si un niño se divierte, aprende sin resistencia. Cada lección se siente como un juego, no como una tarea.",
        color: "text-[#8ED462]",
        bg: "bg-[#8ED462]",
        lightBg: "bg-[#8ED462]/10",
    },
    {
        icon: Users,
        title: "Comunidad Segura",
        desc: "Un ambiente donde los niños se expresan sin miedo a equivocarse. Cada error es un bloque más hacia la fluidez, en un espacio moderado y seguro.",
        color: "text-[#86d2fb]",
        bg: "bg-[#86d2fb]",
        lightBg: "bg-[#86d2fb]/10",
    },
    {
        icon: Heart,
        title: "Pasión Genuina",
        desc: "Un equipo que ama lo que hace. Cada misión, cada mundo y cada clase está diseñada con cariño y dedicación para inspirar a la próxima generación.",
        color: "text-[#ef4444]",
        bg: "bg-[#ef4444]",
        lightBg: "bg-[#ef4444]/10",
    },
];

export default function OurValues() {
    const [activeIndex, setActiveIndex] = useState<number>(0);

    return (
        <section className="relative w-full min-h-screen bg-[#e8e4d8] rounded-[50px] overflow-hidden flex flex-col items-center justify-center px-6 py-28 md:py-36">
            <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col h-full">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                    className="text-center mb-16 lg:mb-24"
                >
                    <span className="inline-block bg-[#ef4444]/10 text-[#dc2626] px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-[0.15em] mb-6">
                        💜 Lo que nos mueve
                    </span>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#222222] tracking-tight leading-[1.05]">
                        Nuestros{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef4444] to-[#f59e0b]">
                            valores
                        </span>
                    </h2>
                </motion.div>

                <div className="flex flex-col lg:flex-row w-full h-[600px] gap-4 cursor-pointer">
                    {values.map((v, i) => {
                        const isActive = activeIndex === i;
                        return (
                            <motion.div
                                key={v.title}
                                layout
                                onClick={() => setActiveIndex(i)}
                                onMouseEnter={() => setActiveIndex(i)}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className={`relative rounded-[40px] overflow-hidden flex flex-col p-8 md:p-12 transition-all duration-500 ease-in-out border border-white/50 shadow-lg ${isActive ? "flex-[4] bg-white" : "flex-[1] bg-white/60 hover:bg-white/80"
                                    }`}
                            >
                                {/* Active State Background Decoration */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.05 }}
                                            exit={{ opacity: 0 }}
                                            className={`absolute inset-0 ${v.bg}`}
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Top Icon */}
                                <motion.div layout className="mb-auto z-10">
                                    <div
                                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-500 ${isActive ? `${v.bg} text-white shadow-xl` : `${v.lightBg} ${v.color}`
                                            }`}
                                    >
                                        <v.icon size={28} strokeWidth={2.5} />
                                    </div>
                                </motion.div>

                                {/* Content */}
                                <motion.div layout className="mt-8 z-10 flex flex-col">
                                    <h3
                                        className={`font-black text-[#222222] whitespace-nowrap lg:whitespace-normal transition-all duration-500 ${isActive ? "text-3xl lg:text-5xl mb-4" : "text-xl lg:text-2xl lg:-rotate-90 lg:origin-bottom-left lg:absolute lg:bottom-12 lg:left-8 mb-0"
                                            }`}
                                    >
                                        {v.title}
                                    </h3>

                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-[#666666] text-lg lg:text-xl font-medium leading-relaxed max-w-lg">
                                                    {v.desc}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
