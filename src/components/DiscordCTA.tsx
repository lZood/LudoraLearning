"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function DiscordCTA() {
    return (
        <section className="relative w-full min-h-screen bg-[#1a1a2e] rounded-t-[50px] rounded-b-[50px] overflow-hidden flex items-center justify-center px-6 py-28 md:py-36">
            {/* Decorative blobs — vibrant on dark background */}
            <div className="absolute top-[-60px] right-[-60px] w-[400px] h-[400px] bg-[#5865F2]/30 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-80px] left-[-40px] w-[350px] h-[350px] bg-[#8ED462]/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-[#a855f7]/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-[#86d2fb]/15 rounded-full blur-[70px] pointer-events-none" />

            {/* Floating decorative emojis */}
            <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[15%] right-[10%] text-5xl md:text-7xl opacity-20 select-none pointer-events-none"
            >
                ⛏️
            </motion.div>
            <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-[20%] left-[8%] text-4xl md:text-6xl opacity-20 select-none pointer-events-none"
            >
                🎮
            </motion.div>
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[40%] left-[5%] text-3xl md:text-5xl opacity-15 select-none pointer-events-none"
            >
                💎
            </motion.div>
            <motion.div
                animate={{ y: [0, 14, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="absolute bottom-[30%] right-[5%] text-4xl md:text-5xl opacity-15 select-none pointer-events-none"
            >
                🗡️
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                className="relative z-10 text-center max-w-4xl"
            >
                {/* Discord Logo SVG */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center mb-10"
                >
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-[#5865F2] rounded-[24px] flex items-center justify-center shadow-[0_15px_50px_rgba(88,101,242,0.4)]">
                        <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-12 md:h-12 fill-white">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                        </svg>
                    </div>
                </motion.div>

                {/* Members badge */}
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex items-center gap-2 bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#9ba2ff] px-5 py-2.5 rounded-full text-sm font-bold mb-8"
                >
                    <span className="w-2.5 h-2.5 bg-[#57F287] rounded-full animate-pulse" />
                    72 miembros en línea
                </motion.div>

                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] mb-6">
                    Únete a nuestra{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5865F2] to-[#9ba2ff]">
                        comunidad
                    </span>
                </h2>

                <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed mb-12">
                    Conecta con otros alumnos, comparte tus logros, participa en eventos exclusivos y recibe soporte directo de los profesores. ¡Tu tribu te espera!
                </p>

                <a
                    href="https://discord.gg/yourlink"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-4 bg-[#5865F2] text-white px-10 py-6 rounded-[20px] font-black text-lg tracking-wide shadow-[0_10px_30px_0_rgba(88,101,242,0.5)] hover:shadow-[0_15px_40px_rgba(88,101,242,0.4)] hover:-translate-y-1 active:translate-y-1 transition-all duration-300"
                >
                    Entrar al Discord
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
            </motion.div>
        </section>
    );
}
