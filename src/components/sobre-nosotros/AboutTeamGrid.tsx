"use client";

import React from "react";
import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";

const teamMembers = [
    { name: "José Carlos", role: "Developer & Designer", image: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    { name: "Alejandro", role: "Software Engineer", image: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
    { name: "Andrea", role: "Head of Marketing", image: "https://i.pravatar.cc/150?u=a04258114e29026702d" },
    { name: "Fernando", role: "Customer Success", image: "https://i.pravatar.cc/150?u=a048581f4e29026701d" },
    { name: "Sebastián", role: "English Teacher", image: "https://i.pravatar.cc/150?u=a04258a2462d826712d" },
    { name: "María", role: "Curriculum Designer", image: "https://i.pravatar.cc/150?u=a042581f4e29026704b" },
];

export default function AboutTeamGrid() {
    return (
        <section className="relative w-full bg-white rounded-[50px] py-24 sm:py-32 px-4 sm:px-6 md:px-12 z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-20 text-[#1a1a1a]">
                    <span className="text-purple-600 font-semibold mb-2 block tracking-wide">Creadores</span>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Conoce al increíble equipo</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamMembers.map((member, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#fcfaf7] border border-gray-100 rounded-3xl p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-default"
                        >
                            <div className="flex flex-col">
                                <h3 className="font-bold text-xl text-[#1a1a1a]">{member.name}</h3>
                                <p className="text-gray-500 text-sm mb-4">{member.role}</p>
                                <a href="#" className="text-gray-400 hover:text-[#1a1a1a] transition-colors w-min">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                            <img
                                src={member.image}
                                alt={member.name}
                                className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover bg-purple-100"
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
