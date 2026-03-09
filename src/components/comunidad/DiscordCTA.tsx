"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function DiscordCTA() {
    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.15, delayChildren: 0.1 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    return (
        <section className="relative w-full min-h-screen bg-[#1a1a2e] rounded-[50px] overflow-hidden flex items-center px-6 py-24 md:py-32 shadow-[0_30px_100px_rgb(88,101,242,0.15)]">
            {/* Decorative blobs */}

            <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                {/* Left — Content */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="flex flex-col gap-8 order-2 lg:order-1"
                >
                    <motion.div variants={itemVariants} className="flex flex-col gap-6">
                        {/* Members badge */}
                        <div className="inline-flex items-center gap-2 bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#9ba2ff] px-5 py-2.5 rounded-full text-sm font-bold w-fit">
                            <span className="w-2.5 h-2.5 bg-[#57F287] rounded-full animate-pulse" />
                            72 miembros en línea
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]">
                            Entra a la <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5865F2] to-[#9ba2ff]">fortaleza</span>
                        </h2>
                    </motion.div>

                    <div className="flex flex-col gap-6 max-w-xl">
                        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-300 font-medium leading-relaxed">
                            Nuestra comunidad en Discord es el punto de encuentro. Encuentra compañeros para misiones, comparte tus construcciones y resuelve dudas con los profesores.
                        </motion.p>
                        <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed">
                            ¡Tu tribu te espera para la siguiente aventura!
                        </motion.p>
                    </div>

                    <motion.div variants={itemVariants}>
                        <a
                            href="https://discord.gg/yourlink"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-4 bg-[#5865F2] text-white px-10 py-6 rounded-[25px] font-black text-xl md:text-2xl tracking-wide shadow-[0_10px_30px_0_rgba(88,101,242,0.4)] hover:shadow-[0_15px_40px_rgba(88,101,242,0.5)] hover:-translate-y-1 hover:scale-105 active:translate-y-1 transition-all duration-300 w-fit"
                        >
                            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white group-hover:animate-bounce">
                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                            </svg>
                            Entrar al Servidor
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </a>
                    </motion.div>
                </motion.div>

                {/* Right — Visual Portal Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.25 }}
                    className="relative aspect-[3/4] md:aspect-[2/3] lg:aspect-[3/4] max-w-sm md:max-w-md mx-auto w-full rounded-[40px] overflow-hidden shadow-2xl order-1 lg:order-2 border border-[#5865F2]/30 group"
                >
                    {/* Background Portal Image Placeholder */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: "url('/images/comunidad/nether-portal-minecraft.gif')" }}
                    />



                </motion.div>

            </div>
        </section>
    );
}
