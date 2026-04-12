"use client";

import React from "react";
import { motion } from "framer-motion";

const teamMembers = [
    {
        name: "Fernando Santiago",
        role: "Director & Game-Dev",
        image: "/images/sobre-nosotros/derlect.webp",
        mcTag: "Derlect",
        blockColor: "bg-[#6B4226]",
        accentColor: "#ff705d",
    },
    {
        name: "Valeria Velázquez",
        role: "Directora & Maestra",
        image: "/images/sobre-nosotros/vale.webp",
        mcTag: "valeust",
        blockColor: "bg-[#5C2D91]",
        accentColor: "#b794f6",
    },
    {
        name: "José Ramirez",
        role: "Web-Dev",
        image: "/images/sobre-nosotros/cucho.webp",
        mcTag: "Zood",
        blockColor: "bg-[#2563EB]",
        accentColor: "#2ba0ff",
    },
    {
        name: "Luis Cortes",
        role: "Game-Dev",
        image: "/images/sobre-nosotros/pammsitoh.webp",
        mcTag: "Pammsitoh",
        blockColor: "bg-[#15803D]",
        accentColor: "#88e04f",
    },
    {
        name: "Maximiliano Bustos",
        role: "Artista PixelArt",
        image: "/images/sobre-nosotros/baku.webp",
        mcTag: "bakuretsubv",
        blockColor: "bg-[#B45309]",
        accentColor: "#f59e0b",
    },
    {
        name: "Kevin Bedoya",
        role: "Game-Dev",
        image: "/images/sobre-nosotros/kevin.webp",
        mcTag: "KevinAlexJn",
        blockColor: "bg-[#0F766E]",
        accentColor: "#2dd4bf",
    },
];

/* Pixel-art role icons as inline SVGs */
const RoleIcon = ({ role }: { role: string }) => {
    if (role.includes("Game-Dev")) {
        // Pickaxe
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" className="fill-current">
                <rect x="10" y="0" width="2" height="2" />
                <rect x="8" y="2" width="2" height="2" />
                <rect x="12" y="2" width="2" height="2" />
                <rect x="6" y="4" width="2" height="2" />
                <rect x="10" y="4" width="2" height="2" />
                <rect x="14" y="4" width="2" height="2" />
                <rect x="4" y="6" width="2" height="2" />
                <rect x="8" y="6" width="2" height="2" />
                <rect x="2" y="8" width="2" height="2" />
                <rect x="6" y="8" width="2" height="2" />
                <rect x="0" y="10" width="2" height="2" />
                <rect x="4" y="10" width="2" height="2" />
                <rect x="0" y="12" width="2" height="2" />
                <rect x="2" y="12" width="2" height="2" />
            </svg>
        );
    }
    if (role.includes("Maestra") || role.includes("Director")) {
        // Book / enchanting table
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" className="fill-current">
                <rect x="2" y="2" width="12" height="2" />
                <rect x="2" y="4" width="2" height="8" />
                <rect x="12" y="4" width="2" height="8" />
                <rect x="4" y="4" width="8" height="2" />
                <rect x="4" y="12" width="8" height="2" />
                <rect x="6" y="6" width="4" height="2" />
                <rect x="6" y="9" width="4" height="2" />
            </svg>
        );
    }
    if (role.includes("Web-Dev")) {
        // Redstone / code block
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" className="fill-current">
                <rect x="2" y="4" width="2" height="2" />
                <rect x="4" y="6" width="2" height="2" />
                <rect x="6" y="8" width="2" height="2" />
                <rect x="4" y="10" width="2" height="2" />
                <rect x="2" y="12" width="2" height="2" />
                <rect x="10" y="4" width="2" height="2" />
                <rect x="10" y="6" width="2" height="2" />
                <rect x="10" y="8" width="2" height="2" />
                <rect x="10" y="10" width="2" height="2" />
                <rect x="10" y="12" width="2" height="2" />
            </svg>
        );
    }
    if (role.includes("Artista") || role.includes("Pixel")) {
        // Paintbrush / palette
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" className="fill-current">
                <rect x="10" y="0" width="2" height="2" />
                <rect x="12" y="2" width="2" height="2" />
                <rect x="8" y="2" width="2" height="2" />
                <rect x="10" y="4" width="2" height="2" />
                <rect x="6" y="4" width="2" height="2" />
                <rect x="8" y="6" width="2" height="2" />
                <rect x="4" y="6" width="2" height="2" />
                <rect x="6" y="8" width="2" height="2" />
                <rect x="2" y="8" width="2" height="2" />
                <rect x="4" y="10" width="2" height="2" />
                <rect x="0" y="10" width="2" height="4" />
                <rect x="2" y="12" width="2" height="2" />
            </svg>
        );
    }
    // Default star
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" className="fill-current">
            <rect x="7" y="0" width="2" height="2" />
            <rect x="6" y="2" width="4" height="2" />
            <rect x="0" y="4" width="16" height="2" />
            <rect x="2" y="6" width="12" height="2" />
            <rect x="4" y="8" width="8" height="2" />
            <rect x="4" y="10" width="2" height="2" />
            <rect x="10" y="10" width="2" height="2" />
            <rect x="2" y="12" width="2" height="2" />
            <rect x="12" y="12" width="2" height="2" />
        </svg>
    );
};

export default function AboutTeamGrid() {
    return (
        <section className="relative w-full bg-white rounded-[50px] py-32 sm:py-40 px-4 sm:px-6 md:px-12 z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] min-h-screen flex flex-col justify-center">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-24 text-[#1a1a1a]">
                    <span className="text-purple-600 font-semibold mb-3 block tracking-wide text-lg">Creadores</span>
                    <h2 className="text-5xl md:text-6xl font-bold tracking-tight">Conoce al increíble equipo</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
                    {teamMembers.map((member, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, type: "spring", bounce: 0.3 }}
                            className="group relative bg-[#1a1a2e] rounded-2xl overflow-hidden cursor-default hover:-translate-y-2 transition-all duration-300"
                        >
                            {/* Top accent bar — block color */}
                            <div className={`h-2 w-full ${member.blockColor}`} />

                            {/* Subtle pixel grid background */}
                            <div
                                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                style={{
                                    backgroundImage: `
                                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                                    `,
                                    backgroundSize: "16px 16px",
                                }}
                            />

                            <div className="relative z-10 p-8 flex flex-col items-center text-center">
                                {/* Avatar with pixelated border */}
                                <div className="relative mb-6">
                                    {/* Glow on hover */}
                                    <div
                                        className="absolute inset-0 rounded-xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                                        style={{ backgroundColor: member.accentColor }}
                                    />
                                    <div
                                        className="relative w-28 h-28 md:w-36 md:h-36 rounded-xl overflow-hidden border-4 shadow-lg"
                                        style={{ borderColor: member.accentColor, imageRendering: "auto" }}
                                    >
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* MC-style nametag */}
                                <div className="bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-lg mb-3 border border-white/10">
                                    <span className="text-white font-bold text-sm tracking-wider">{member.mcTag}</span>
                                </div>

                                {/* Name */}
                                <h3 className="font-bold text-xl md:text-2xl text-white mb-2">{member.name}</h3>

                                {/* Role badge with pixel icon */}
                                <div
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold"
                                    style={{
                                        backgroundColor: `${member.accentColor}20`,
                                        color: member.accentColor,
                                        border: `1px solid ${member.accentColor}40`,
                                    }}
                                >
                                    <RoleIcon role={member.role} />
                                    {member.role}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
