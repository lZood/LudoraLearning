"use client";

import React from "react";
import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";

const teamMembers = [
    { name: "Fernando Santiago", role: "Director & Game-Dev", image: "https://i.pravatar.cc/300?u=fernando" },
    { name: "Valeria Velázquez", role: "Directora & Maestra", image: "/images/sobre-nosotros/vale.webp" },
    { name: "José Carlos", role: "Web-Dev", image: "/images/sobre-nosotros/cucho.webp" },
    { name: "Luis Cortés", role: "Game-Dev", image: "https://i.pravatar.cc/300?u=luis" },
    { name: "Maximiliano Bustos", role: "Artista PixelArt", image: "/images/sobre-nosotros/baku.webp" },
];

export default function AboutTeamGrid() {
    return (
        <section className="relative w-full bg-white rounded-[50px] py-32 sm:py-40 px-4 sm:px-6 md:px-12 z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] min-h-screen flex flex-col justify-center">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-24 text-[#1a1a1a]">
                    <span className="text-purple-600 font-semibold mb-3 block tracking-wide text-lg">Creadores</span>
                    <h2 className="text-5xl md:text-6xl font-bold tracking-tight">Conoce al increíble equipo</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                    {teamMembers.map((member, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`bg-[#fcfaf7] border border-gray-100 rounded-[2.5rem] p-10 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300 cursor-default group ${i >= 3 ? 'lg:translate-x-[50%]' : ''}`}
                        >
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-purple-200 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity" />
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl object-cover bg-purple-100 relative z-10"
                                />
                            </div>

                            <div className="flex flex-col items-center">
                                <h3 className="font-bold text-2xl md:text-3xl text-[#1a1a1a] mb-2">{member.name}</h3>
                                <p className="text-purple-600 font-medium text-lg mb-6">{member.role}</p>
                                <a href="#" className="text-gray-400 hover:text-[#8B5CF6] transition-all transform hover:scale-110">
                                    <Linkedin className="w-8 h-8" />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
