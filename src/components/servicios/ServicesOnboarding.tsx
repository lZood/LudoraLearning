"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export default function ServicesOnboarding() {
    const steps = [
        {
            title: "Evaluación inicial",
            description: "Para determinar el nivel de inglés y agrupar al alumno correctamente.",
            iconSrc: "/images/service-page/woodlog.webp",
            borderColor: "border-[#86d2fb]/30",
            bg: "bg-[#f5f1e4]",
        },
        {
            title: "Sesión de prueba",
            description: "Ofrecemos una sesión gratuita de 30 minutos para que conozcas la metodología.",
            iconSrc: "/images/service-page/ironblock.webp",
            borderColor: "border-[#f59e0b]/30",
            bg: "bg-[#f5f1e4]",
        },
        {
            title: "Inscripción",
            description: "Acceso inmediato al portal de alumnos y al servidor privado de Minecraft.",
            iconSrc: "/images/service-page/emeraldbloc.webp",
            borderColor: "border-[#8ED462]/30",
            bg: "bg-[#f5f1e4]",
        }
    ];

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.2 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.5, type: "spring", bounce: 0.3 },
        },
    };

    return (
        <section className="relative w-full min-h-screen bg-white rounded-b-[50px] overflow-hidden flex flex-col items-center justify-center px-6 py-24 md:py-32">
            <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-center lg:grid lg:grid-cols-2 lg:gap-20">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                    className="text-center lg:text-left mb-16 lg:mb-0 flex flex-col items-center lg:items-start"
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#222222] tracking-tight leading-[1.05] mb-8">
                        Proceso de <br />
                        <span className="text-[#2a8ebd]">
                            Incorporación
                        </span>
                    </h2>
                    <p className="text-xl md:text-2xl text-[#444444] font-medium leading-relaxed max-w-lg">
                        Comenzar en Ludora es muy sencillo. Hemos diseñado un proceso rápido para que los alumnos entren a jugar y aprender lo antes posible.
                    </p>
                </motion.div>

                {/* Steps Timeline / Inventory layout */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="flex flex-col gap-8 relative w-full max-w-md lg:max-w-none"
                >
                    {/* Decorative connecting line */}
                    <div className="absolute left-10 md:left-14 top-10 bottom-10 w-1 bg-gradient-to-b from-[#86d2fb]/30 via-[#f59e0b]/30 to-[#8ED462]/30 rounded-full z-0 hidden sm:block" />

                    {steps.map((step, index) => (
                        <motion.div key={index} variants={itemVariants} className="relative z-10 flex items-center gap-6 md:gap-8 hover:translate-x-2 transition-transform duration-300 group">
                            {/* Icon Box (Minecraft Item Style) */}
                            <div className={`relative flex-shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-[24px] ${step.bg} flex items-center justify-center border-4 ${step.borderColor} shadow-lg overflow-hidden`}>
                                {/* Number Badge */}
                                <div className="absolute top-2 left-2 text-xs font-black text-gray-400 opacity-50 z-20">
                                    {index + 1}
                                </div>
                                <img
                                    src={step.iconSrc}
                                    alt={step.title}
                                    className="w-12 h-12 md:w-16 md:h-16 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                                    onError={(e) => {
                                        // Fallback icon logic just in case image is missing
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement?.classList.add('bg-gray-200');
                                    }}
                                />
                            </div>

                            {/* Text content */}
                            <div className="flex-1 bg-white p-6 rounded-[24px] shadow-md border border-gray-100 group-hover:border-gray-200 group-hover:shadow-lg transition-all">
                                <h3 className="text-xl md:text-2xl font-black text-[#222222] mb-2">{step.title}</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
