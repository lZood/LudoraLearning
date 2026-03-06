"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

function BlockyDecoration({ delay, className, color }: { delay: number, className: string, color: string }) {
    return (
        <motion.div
            animate={{
                y: [0, -15, 0],
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
            }}
            className={`absolute pointer-events-none opacity-20 ${className}`}
        >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" fill={color} />
                <rect x="20" y="20" width="20" height="20" fill={color} />
            </svg>
        </motion.div>
    );
}

export default function AboutCTA() {
    return (
        <section className="relative w-full min-h-screen bg-[#1a1a2e] rounded-t-[50px] overflow-hidden flex items-center justify-center px-6 py-28 md:py-36 border-t-8 border-[#2e2e4f]/30">
            {/* Background Texture/Grid (Subtle) */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Blocky Decorations */}
            <BlockyDecoration delay={0} className="top-[15%] right-[15%]" color="#8ED462" />
            <BlockyDecoration delay={1.5} className="bottom-[20%] left-[10%]" color="#3b82f6" />
            <BlockyDecoration delay={0.7} className="top-[40%] left-[5%] scale-75" color="#a855f7" />
            <BlockyDecoration delay={2.2} className="top-[30%] right-[5%] scale-150 rotate-90" color="#f59e0b" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                className="relative z-10 max-w-4xl mx-auto text-center bg-[#2e2e4f]/30 backdrop-blur-md p-10 md:p-16 rounded-[40px] border-4 border-[#3e3e6f]/50 shadow-[10px_10px_0px_#0f0f1c]"
            >
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] mb-6">
                    ¿Listo para la{" "}
                    <span className="text-[#8ED462] inline-block -rotate-2 transform">
                        aventura?
                    </span>
                </h2>
                <p className="text-lg md:text-xl text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed mb-12">
                    Agenda una clase de prueba gratuita y descubre cómo tu hijo puede aprender inglés mientras se divierte en Minecraft.
                </p>
                <div className="flex justify-center">
                    <Link
                        href="/contacto"
                        className="group relative inline-flex items-center justify-center px-10 py-5 font-black text-white text-xl transition-all bg-[#00a82d] border-4 border-[#006e1d] rounded-none overflow-hidden hover:bg-[#00c234] hover:shadow-[10px_10px_0px_#000000] shadow-[6px_6px_0px_#000000] active:shadow-none active:translate-x-[6px] active:translate-y-[6px]"
                    >
                        AGENDAR CLASE DE PRUEBA
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
