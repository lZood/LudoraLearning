"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface LudoraCardProps {
    title: string;
    body: string;
    buttonText: string;
    buttonHref: string;
    secondaryColor: string;
    position?: "justify-start" | "justify-center" | "justify-end";
}

export default function LudoraCard({
    title,
    body,
    buttonText,
    buttonHref,
    secondaryColor,
    position = "justify-start",
}: LudoraCardProps) {

    // Capa 0: Contenedor para coordinar
    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1, // Capa 2 aparece 0.1s después de Capa 1
            },
        },
    };

    // Capa 1: Bloque de Color (Color Reveal)
    const colorBlockVariants: Variants = {
        hidden: { scale: 0.5, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" },
        },
    };

    // Capa 2: Tarjeta Blanca (Content Bounce)
    const cardVariants: Variants = {
        hidden: { scale: 0.8, opacity: 0, y: 30 },
        visible: {
            scale: 1,
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 85,
                damping: 20,
            },
        },
    };

    return (
        <div className={`w-full flex ${position}`}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="relative w-full max-w-2xl"
            >
                {/* Layer 1: Bloque de Color (Oculto exactamente detrás) */}
                <motion.div
                    variants={colorBlockVariants}
                    className="absolute inset-0 rounded-2xl md:rounded-[32px]"
                    style={{ backgroundColor: secondaryColor }}
                />

                {/* Layer 2: Tarjeta Blanca (Limpia y sin bordes negros ni sombras gruesas) */}
                <motion.div
                    variants={cardVariants}
                    className="relative bg-[#ffffff] rounded-2xl md:rounded-[32px] p-10 md:p-14 border-0 flex flex-col items-start text-left shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                >
                    <h3 className="text-4xl md:text-[3.25rem] font-medium tracking-tight text-[#222222] mb-6">
                        {title}
                    </h3>
                    <p className="text-xl md:text-[22px] text-[#333333] leading-snug mb-10 w-full text-left font-normal">
                        {body}
                    </p>

                    <Link
                        href={buttonHref}
                        className="inline-flex items-center gap-4 rounded-xl pl-6 pr-2 py-2 transition-transform hover:scale-105"
                        style={{ backgroundColor: secondaryColor }}
                    >
                        <span className="font-medium text-white text-lg">{buttonText}</span>
                        <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                            <ChevronRight className="w-5 h-5 text-black" strokeWidth={3} />
                        </div>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
