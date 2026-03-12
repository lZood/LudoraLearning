"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, Coins, Hammer, ShieldAlert, Sparkles } from "lucide-react";

const skills = [
    {
        id: "survival",
        title: "Supervivencia Básica",
        english: "Vocabulario de recursos (Wood, Stone), verbos de acción simple (I need, Where is).",
        icon: <Compass className="w-8 h-8 md:w-10 md:h-10 text-[#a855f7]" />,
        bgColor: "bg-[#a855f7]/10",
        borderColor: "border-[#a855f7]/30",
        position: "center",
    },
    {
        id: "trading",
        title: "Negociación",
        english: "Intercambios, números, condicionales básicos (If you give me..., I will...).",
        icon: <Coins className="w-8 h-8 md:w-10 md:h-10 text-[#f59e0b]" />,
        bgColor: "bg-[#f59e0b]/10",
        borderColor: "border-[#f59e0b]/30",
        position: "left",
    },
    {
        id: "building",
        title: "Ingeniería Blanda",
        english: "Direcciones (Up, Down, Behind), preposiciones de lugar, descripciones espaciales.",
        icon: <Hammer className="w-8 h-8 md:w-10 md:h-10 text-[#86d2fb]" />,
        bgColor: "bg-[#86d2fb]/10",
        borderColor: "border-[#86d2fb]/30",
        position: "right",
    },
    {
        id: "combat",
        title: "Táctica y Defensa",
        english: "Órdenes rápidas (Watch out, Run, Attack), tiempos continuos (They are coming).",
        icon: <ShieldAlert className="w-8 h-8 md:w-10 md:h-10 text-[#ef4444]" />,
        bgColor: "bg-[#ef4444]/10",
        borderColor: "border-[#ef4444]/30",
        position: "left",
    },
    {
        id: "redstone",
        title: "Lógica Compleja",
        english: "Causa y efecto (Because, Therefore), conectores lógicos, gramática condicional avanzada.",
        icon: <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-[#10b981]" />,
        bgColor: "bg-[#10b981]/10",
        borderColor: "border-[#10b981]/30",
        position: "right",
    },
];

export default function SkillTree() {
    return (
        <section className="relative w-full py-24 md:py-32 bg-[#222222] overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />

            <div className="relative z-10 max-w-[90vw] xl:max-w-[70vw] mx-auto text-center mb-16 md:mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                >
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6">
                        El Mapa de <span className="text-[#a855f7]">Habilidades</span>
                    </h2>
                    <p className="text-[#cccccc] text-lg md:text-xl font-medium max-w-3xl mx-auto">
                        Cada reto en el juego desbloquea competencias lingüísticas reales. Olvídate de los libros aburridos; aquí el progreso se vive y se siente.
                    </p>
                </motion.div>
            </div>

            {/* Tree Container */}
            <div className="relative z-10 max-w-3xl mx-auto px-4">
                {/* Central Line */}
                <div className="absolute top-0 bottom-0 left-[50%] w-1 bg-gradient-to-b from-[#a855f7] via-[#86d2fb] to-[#10b981] opacity-30 transform -translate-x-1/2 rounded-full hidden md:block" />

                <div className="flex flex-col gap-12 md:gap-24 relative">
                    {skills.map((skill, index) => {
                        const isLeft = skill.position === "left";
                        const isRight = skill.position === "right";
                        const isCenter = skill.position === "center";

                        return (
                            <motion.div
                                key={skill.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: 0.1 * index }}
                                className={`relative flex items-center justify-center md:justify-start w-full ${isLeft ? "md:flex-row-reverse" : "md:flex-row"}`}
                            >
                                {/* Center Connector Dot for Desktop */}
                                <div className="hidden md:flex absolute left-[50%] transform -translate-x-1/2 w-6 h-6 rounded-full bg-[#222] border-4 border-white z-20 shadow-[0_0_15px_rgba(255,255,255,0.5)]" />

                                {/* Card Container */}
                                <div className={`w-full md:w-[45%] ${isCenter ? "md:mx-auto md:w-[60%]" : ""} z-10`}>
                                    <div className={`relative group p-6 md:p-8 rounded-[30px] bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 transition-all duration-300 ${isLeft && !isCenter ? "md:text-right" : "text-left"} flex flex-col items-center md:items-start ${isLeft && !isCenter ? "md:items-end" : ""}`}>

                                        {/* Icon Container bg glow */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 rounded-[30px] pointer-events-none" />

                                        {/* Icon */}
                                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-6 border ${skill.borderColor} ${skill.bgColor} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                            {skill.icon}
                                        </div>

                                        <h3 className="text-white text-2xl md:text-3xl font-black mb-3 text-center md:text-left">
                                            {skill.title}
                                        </h3>

                                        <div className={`w-full max-w-sm  ${isLeft && !isCenter ? "ml-auto text-center md:text-right" : "mx-auto md:mx-0 pr-4"}`}>
                                            <p className="text-[#a1a1aa] font-medium leading-relaxed">
                                                <span className="text-white font-bold block mb-1 font-mono text-sm tracking-widest text-[#a855f7]">LOGRO:</span>
                                                {skill.english}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
