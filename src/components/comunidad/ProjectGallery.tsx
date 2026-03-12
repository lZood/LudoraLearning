"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const projects = [
    {
        id: 1,
        title: "Granja Automática",
        category: "Redstone & Lógica",
        level: "Nivel 2",
        description: "Los alumnos automatizaron la recolección de cultivos, debatiendo en inglés sobre circuitos lógicos y eficiencia.",
        image: "https://images.unsplash.com/photo-1616588589676-62b3d4ff6a10?auto=format&fit=crop&w=800&q=80",
        span: "col-span-1 md:col-span-2 row-span-2"
    },
    {
        id: 2,
        title: "Ciudad Sustentable",
        category: "Medio Ambiente",
        level: "Nivel 3",
        description: "Diseño de una ciudad con paneles solares y reciclaje. Vocabulario centrado en ecología.",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
        span: "col-span-1 row-span-1"
    },
    {
        id: 3,
        title: "Castillo Medieval",
        category: "Historia & Arquitectura",
        level: "Nivel 1",
        description: "Construcción colaborativa usando verbos de acción y direcciones básicas en inglés.",
        image: "https://images.unsplash.com/photo-1610484826967-09c5720778c7?auto=format&fit=crop&w=800&q=80",
        span: "col-span-1 row-span-1"
    },
    {
        id: 4,
        title: "Refugio Submarino",
        category: "Supervivencia Extrema",
        level: "Nivel 4",
        description: "Planificación avanzada para construcción bajo el agua con gestión de recursos limitados.",
        image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=800&q=80",
        span: "col-span-1 md:col-span-2 row-span-1"
    },
    {
        id: 5,
        title: "Museo de Arte Pixelado",
        category: "Creatividad",
        level: "Nivel 2",
        description: "Exposición de arte en bloques. Los estudiantes presentaron sus obras describiendo colores y formas.",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
        span: "col-span-1 row-span-1"
    },
];

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{
                duration: 0.6,
                delay: index * 0.1,
                type: "spring",
                bounce: 0.25,
            }}
            className={`group relative overflow-hidden rounded-[32px] md:rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white ${project.span}`}
        >
            <div className="absolute inset-0">
                <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Content */}
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
                <div className="flex justify-between items-start w-full mb-auto mt-2">
                    <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/30 shadow-sm">
                        {project.level}
                    </span>
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 border border-white/20">
                        <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                </div>

                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-[#8ED462] font-bold text-sm tracking-widest uppercase mb-2">
                        {project.category}
                    </p>
                    <h3 className="text-white text-3xl md:text-4xl font-black mb-3 leading-tight drop-shadow-lg">
                        {project.title}
                    </h3>
                    <p className="text-[#e2e2e2] text-sm md:text-base font-medium opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto transition-all duration-300 line-clamp-2 md:line-clamp-3">
                        {project.description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export default function ProjectGallery() {
    return (
        <section className="relative w-full py-24 md:py-32 bg-[#e8e4d8] rounded-[50px] overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <div className="relative z-10 max-w-[90vw] xl:max-w-[85vw] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                    className="mb-16 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#222222] tracking-tight leading-[1.05] mb-6">
                            Galería de <br className="hidden md:block" />
                            <span className="text-[#8ED462] drop-shadow-sm">Logros Reales</span>
                        </h2>
                        <p className="text-[#555555] text-lg md:text-xl font-medium">
                            En Ludora no solo "jugamos". Cada sesión termina con un proyecto tangible construido colaborativamente, aplicando el inglés de forma práctica y útil.
                        </p>
                    </div>
                </motion.div>

                {/* CSS Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[300px] gap-4 md:gap-6">
                    {projects.map((project, index) => (
                        <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
