"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

type Step = {
    number: string;
    title: string;
    description: string;
    accent: string;
    mockupBg: string;
    image: string;
    imageAlt: string;
};

const steps: Step[] = [
    {
        number: "01",
        title: "Evaluación de nivel",
        description: "Haz nuestra evaluación gratuita en la plataforma para conocer tu nivel de inglés y ubicarte correctamente.",
        accent: "#88e04f",
        mockupBg: "bg-gradient-to-br from-[#d4f5c0] to-[#88e04f]/30",
        image: "/images/service-page/evaluacion.webp",
        imageAlt: "Evaluación de nivel de inglés en la plataforma Ludora",
    },
    {
        number: "02",
        title: "Inscríbete",
        description: "Adquiere los servicios de Ludora Learning con las clases en vivo, y obtén acceso inmediato a todo el contenido.",
        accent: "#632eaf",
        mockupBg: "bg-gradient-to-br from-[#e5d5ff] to-[#632eaf]/25",
        image: "/images/service-page/inscribete.webp",
        imageAlt: "Proceso de inscripción a Ludora Learning",
    },
    {
        number: "03",
        title: "Juega y aprende",
        description: "Avanza en el portal con cursos y videos, y aplica lo aprendido en el servidor privado de Minecraft.",
        accent: "#ff705d",
        mockupBg: "bg-gradient-to-br from-[#ffd9d1] to-[#ff705d]/30",
        image: "/images/service-page/juega.webp",
        imageAlt: "Alumno jugando y aprendiendo inglés en Minecraft",
    },
];

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, type: "spring", bounce: 0.25 },
    },
};

export default function ServicesOnboarding() {
    return (
        <section className="relative w-full bg-white rounded-[50px] overflow-hidden px-6 py-16 md:py-20 min-h-screen flex flex-col justify-center">
            <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#222222] tracking-tight leading-[1.05]">
                        Tu aventura empieza en <span className="text-[#632eaf]">3 pasos</span>
                    </h2>
                </motion.div>

                {/* Steps grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
                >
                    {steps.map((step) => {
                        return (
                            <motion.div
                                key={step.number}
                                variants={itemVariants}
                                className="flex flex-col"
                            >
                                {/* Image card */}
                                <div className={`${step.mockupBg} relative rounded-[24px] flex items-center justify-center h-[280px] md:h-[300px] mb-4 overflow-hidden`}>
                                    <Image
                                        src={step.image}
                                        alt={step.imageAlt}
                                        fill
                                        sizes="(min-width: 768px) 33vw, 100vw"
                                        className="object-cover"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-2 px-1">
                                    <h3 className="text-xl md:text-2xl font-black text-[#1d1d1b] leading-tight">
                                        <span style={{ color: step.accent }}>{step.number}.</span>{" "}
                                        {step.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex justify-center"
                >
                    <Link
                        href="/portal-alumno/evaluacion"
                        className="group inline-flex items-center gap-3 bg-[#1d1d1b] hover:bg-[#632eaf] text-white px-8 py-4 rounded-full font-bold text-base transition-colors duration-300 shadow-lg hover:shadow-xl"
                    >
                        Empieza tu evaluación gratis
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
