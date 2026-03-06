"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { GraduationCap, Code, Gamepad2, Palette, Wrench } from "lucide-react";

interface TeamMember {
    name: string;
    role: string;
    bio: string;
    avatar: string;
    accentColor: string;
    accentBg: string; // Used as arbitrary tailwind class like bg-[#...]
    shadowColor: string;
    icon: React.ElementType;
    featured?: boolean;
}

const team: TeamMember[] = [
    {
        name: "Valeria Sempual",
        role: "Fundadora & Maestra",
        bio: "La mente y el corazón detrás de Ludora. Valeria creó esta metodología fusionando su pasión por la enseñanza del inglés con el mundo de Minecraft, logrando que cada alumno aprenda sin darse cuenta de que está estudiando.",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Valeria&backgroundColor=c0aede",
        accentColor: "text-[#a855f7]",
        accentBg: "bg-[#a855f7]",
        shadowColor: "rgba(168,85,247,0.3)",
        icon: GraduationCap,
        featured: true,
    },
    {
        name: "Derlect",
        role: "Desarrollador de Mundos",
        bio: "Arquitecto de las experiencias interactivas. Diseña y programa los mundos de Minecraft donde ocurren las lecciones, creando misiones que enseñan vocabulario y gramática.",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Derlect&backgroundColor=b6e3f4",
        accentColor: "text-[#3b82f6]",
        accentBg: "bg-[#3b82f6]",
        shadowColor: "rgba(59,130,246,0.3)",
        icon: Code,
    },
    {
        name: "Pammsitoh",
        role: "Programador & Builder",
        bio: "Especialista en mecánicas de juego educativas. Convierte cada objetivo de aprendizaje en una aventura interactiva que los alumnos quieren repetir.",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Pammsitoh&backgroundColor=ffd5dc",
        accentColor: "text-[#ef4444]",
        accentBg: "bg-[#ef4444]",
        shadowColor: "rgba(239,68,68,0.3)",
        icon: Gamepad2,
    },
    {
        name: "FineArts",
        role: "Diseñador & Programador",
        bio: "El ojo artístico del equipo. Se encarga de que cada mundo, textura y interfaz sea visualmente atractiva para crear un entorno de aprendizaje inmersivo.",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=FineArts&backgroundColor=d1d4f9",
        accentColor: "text-[#8ED462]",
        accentBg: "bg-[#8ED462]",
        shadowColor: "rgba(142,212,98,0.3)",
        icon: Palette,
    },
    {
        name: "Kevin",
        role: "Desarrollador Backend",
        bio: "El motor invisible que hace que todo funcione. Mantiene el servidor, los sistemas de progreso y las herramientas que conectan a alumnos con profesores.",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kevin&backgroundColor=b6e3f4",
        accentColor: "text-[#f59e0b]",
        accentBg: "bg-[#f59e0b]",
        shadowColor: "rgba(245,158,11,0.3)",
        icon: Wrench,
    },
];

export default function TeamSection() {
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
            transition: { duration: 0.6, type: "spring", bounce: 0.3 },
        },
    };

    return (
        <section className="relative w-full min-h-screen bg-[#fafafa] rounded-[50px] overflow-hidden flex items-center px-6 py-28 md:py-36">
            <div className="relative z-10 max-w-7xl mx-auto w-full">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <span className="inline-block bg-[#8ED462]/15 text-[#3d7a1c] px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-[0.15em] mb-6">
                        👥 Nuestro Equipo
                    </span>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#222222] tracking-tight leading-[1.05]">
                        Las personas detrás de la{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ED462] to-[#4caf2e]">
                            magia
                        </span>
                    </h2>
                </motion.div>

                {/* Featured Member — Valeria */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {team.filter(m => m.featured).map((member) => (
                        <motion.div
                            key={member.name}
                            variants={itemVariants}
                            className="mb-12 md:mb-16"
                        >
                            <div className="group bg-white rounded-[40px] md:rounded-[50px] p-8 md:p-14 shadow-sm border border-black/5 flex flex-col md:flex-row items-center gap-10 md:gap-16 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out"
                                style={{
                                    '--hover-shadow-color': member.shadowColor,
                                } as React.CSSProperties}
                            >
                                {/* Avatar */}
                                <div className="shrink-0 relative">
                                    <div className={`absolute inset-0 ${member.accentBg} blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                                    <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                                        <img
                                            src={member.avatar}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-grow text-center md:text-left">
                                    <div className={`inline-flex items-center gap-2 ${member.accentBg}/10 ${member.accentColor} px-5 py-2 rounded-full text-sm font-bold uppercase tracking-[0.15em] mb-4`}>
                                        <member.icon className="w-4 h-4" />
                                        {member.role}
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-black text-[#222222] tracking-tight mb-5">
                                        {member.name}
                                    </h3>
                                    <p className="text-lg md:text-xl text-[#666666] font-medium leading-relaxed max-w-2xl">
                                        {member.bio}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Team Grid — Regular Members */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {team.filter(m => !m.featured).map((member) => (
                            <motion.div
                                key={member.name}
                                variants={itemVariants}
                                className="group bg-white rounded-[32px] p-8 flex flex-col items-center text-center shadow-sm border border-black/5 hover:-translate-y-2 hover:shadow-xl transition-all duration-500 ease-out flex-1 flex-grow"
                            >
                                {/* Avatar */}
                                <div className="relative mb-6">
                                    <div className={`absolute inset-0 ${member.accentBg} blur-[20px] opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                        <img
                                            src={member.avatar}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                            style={{ backgroundColor: `${member.accentColor.replace('text-[', '').replace(']', '')}15` }}
                                        />
                                    </div>
                                </div>

                                {/* Role badge */}
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] mb-4 ${member.accentColor} ${member.accentBg}/10`}>
                                    <member.icon className="w-3.5 h-3.5" />
                                    {member.role}
                                </div>

                                {/* Name */}
                                <h3 className="text-2xl font-black text-[#222222] mb-3">{member.name}</h3>

                                {/* Bio */}
                                <p className="text-sm md:text-base text-[#666666] font-medium leading-relaxed">
                                    {member.bio}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
