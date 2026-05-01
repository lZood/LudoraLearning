"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const plans = {
    basic: {
        name: "Ludora Estándar",
        tagline: "Ideal para aprender a tu ritmo",
        price: "$399",
        period: "/ mes",
        classesCount: 1,
        classesTotal: 4,
        icon: "/images/service-page/ironblock.webp",
        accent: "#6B7280",
        features: [
            "Evaluación adaptativa con IA (5 categorías)",
            "Biblioteca de videos, material interactivo y quizzes",
            "Gamificación: ligas, XP, logros y leaderboards",
            "Reportes de progreso para padres",
            "Comunidad activa en Discord",
        ],
        cta: "Empezar con estándar",
        ctaHref: "/portal-alumno/registro?plan=basic",
    },
    plus: {
        name: "Ludora Plus",
        tagline: "La experiencia completa",
        price: "$999",
        period: "/ mes",
        classesCount: 4,
        classesTotal: 4,
        icon: "/images/service-page/diamond.webp",
        accent: "#632eaf",
        features: [
            "Evaluación adaptativa con IA (5 categorías)",
            "Biblioteca de videos, material interactivo y quizzes",
            "Gamificación: ligas, XP, logros y leaderboards",
            "Reportes de progreso para padres",
            "Comunidad activa en Discord",
        ],
        cta: "Elegir Ludora Plus",
        ctaHref: "/portal-alumno/registro?plan=plus",
    },
};

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};

const featureVariants: Variants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.35, ease: "easeOut" },
    },
};

/* Pixel check icon */
const PixelCheck = ({ color }: { color: string }) => (
    <svg
        width="12"
        height="12"
        viewBox="0 0 14 14"
        className="shrink-0 mt-1"
        style={{ imageRendering: "pixelated" }}
    >
        <rect x="10" y="3" width="2" height="2" fill={color} />
        <rect x="8" y="5" width="2" height="2" fill={color} />
        <rect x="6" y="7" width="2" height="2" fill={color} />
        <rect x="4" y="9" width="2" height="2" fill={color} />
        <rect x="2" y="7" width="2" height="2" fill={color} />
    </svg>
);

/* Pixel arrow */
const PixelArrow = ({ color = "currentColor" }: { color?: string }) => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        className="shrink-0 group-hover:translate-x-1 transition-transform"
        style={{ imageRendering: "pixelated" }}
    >
        <rect x="8" y="3" width="2" height="2" fill={color} />
        <rect x="10" y="5" width="2" height="2" fill={color} />
        <rect x="12" y="7" width="2" height="2" fill={color} />
        <rect x="2" y="7" width="10" height="2" fill={color} />
        <rect x="10" y="9" width="2" height="2" fill={color} />
        <rect x="8" y="11" width="2" height="2" fill={color} />
    </svg>
);

/* Compact class slot — smaller & inline */
const ClassSlot = ({ filled, icon, accent }: { filled: boolean; icon: string; accent: string }) => (
    <div
        className="relative w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
            backgroundColor: filled ? `${accent}15` : "rgba(0,0,0,0.04)",
            border: filled ? `1.5px solid ${accent}50` : "1.5px dashed rgba(0,0,0,0.12)",
        }}
    >
        {filled && (
            <img
                src={icon}
                alt="Clase"
                className="w-5 h-5 object-contain"
                style={{ imageRendering: "pixelated" }}
            />
        )}
    </div>
);

export default function ServicePricing() {
    return (
        <section className="relative w-full bg-[#86d2fb] rounded-[50px] overflow-hidden px-6 py-16 md:py-20 min-h-screen flex flex-col justify-center">
            <div className="relative z-10 max-w-5xl mx-auto w-full">

                {/* Header — compact */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.05] drop-shadow-sm">
                        Elige tu <span className="text-[#632eaf]">plan</span>
                    </h2>
                    <p className="mt-3 text-sm md:text-base text-white/90 font-medium">
                        Sin permanencia. Cancela cuando quieras.
                    </p>
                </motion.div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">

                    {/* ── Plan 1: Ludora Estándar ─────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
                        className="relative bg-white border-2 border-gray-200 rounded-[24px] p-6 flex flex-col"
                    >
                        {/* Header row: icon + name */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <img
                                    src={plans.basic.icon}
                                    alt="Iron Block"
                                    className="w-8 h-8 object-contain drop-shadow-sm"
                                    style={{ imageRendering: "pixelated" }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl md:text-2xl font-black text-[#1d1d1b] leading-tight">
                                    {plans.basic.name}
                                </h3>
                                <p className="text-xs text-gray-500">{plans.basic.tagline}</p>
                            </div>
                        </div>

                        {/* Compact class row — inline */}
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-5">
                            <div className="flex gap-1.5">
                                {Array.from({ length: plans.basic.classesTotal }).map((_, i) => (
                                    <ClassSlot
                                        key={i}
                                        filled={i < plans.basic.classesCount}
                                        icon={plans.basic.icon}
                                        accent={plans.basic.accent}
                                    />
                                ))}
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">
                                    Clases en vivo
                                </p>
                                <p className="text-sm font-black text-[#1d1d1b]">
                                    {plans.basic.classesCount}<span className="text-gray-400 font-medium">/{plans.basic.classesTotal} al mes</span>
                                </p>
                            </div>
                        </div>

                        {/* Features list */}
                        <motion.ul
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="flex flex-col gap-2 mb-5 flex-1"
                        >
                            {plans.basic.features.map((feature) => (
                                <motion.li
                                    key={feature}
                                    variants={featureVariants}
                                    className="flex items-start gap-2.5"
                                >
                                    <PixelCheck color="#6B7280" />
                                    <span className="text-xs md:text-sm text-gray-700 leading-snug">
                                        {feature}
                                    </span>
                                </motion.li>
                            ))}
                        </motion.ul>

                        {/* Price */}
                        <div className="mb-4">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl md:text-4xl font-black text-[#1d1d1b]">
                                    {plans.basic.price}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">{plans.basic.period}</span>
                                <span className="text-[10px] text-gray-400 ml-1">MXN</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <Link
                            href={plans.basic.ctaHref}
                            className="group w-full inline-flex items-center justify-center gap-2 bg-[#1d1d1b] hover:bg-[#2d2d2b] text-white px-5 py-3 rounded-full font-bold text-sm transition-colors"
                        >
                            {plans.basic.cta}
                            <PixelArrow color="#ffffff" />
                        </Link>
                    </motion.div>

                    {/* ── Plan 2: Ludora Plus ─────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.08, type: "spring", bounce: 0.2 }}
                        className="relative bg-white border-2 border-[#632eaf] rounded-[24px] p-6 flex flex-col shadow-lg"
                    >
                        {/* POPULAR badge */}
                        <div className="absolute -top-3 right-5">
                            <div className="bg-[#632eaf] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider shadow-md">
                                ✦ MÁS POPULAR
                            </div>
                        </div>

                        {/* Header row: animated diamond + name */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#e5d5ff] to-[#632eaf]/25 flex items-center justify-center relative overflow-hidden">
                                <motion.img
                                    src={plans.plus.icon}
                                    alt="Diamond"
                                    className="w-8 h-8 object-contain relative z-10"
                                    style={{ imageRendering: "pixelated" }}
                                    animate={{
                                        y: [0, -2, 0],
                                        filter: [
                                            "drop-shadow(0 2px 4px rgba(99,46,175,0.3))",
                                            "drop-shadow(0 4px 10px rgba(99,46,175,0.5))",
                                            "drop-shadow(0 2px 4px rgba(99,46,175,0.3))",
                                        ],
                                    }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl md:text-2xl font-black text-[#1d1d1b] leading-tight">
                                    {plans.plus.name}
                                </h3>
                                <p className="text-xs text-[#632eaf] font-semibold">{plans.plus.tagline}</p>
                            </div>
                        </div>

                        {/* Compact class row */}
                        <div className="flex items-center gap-3 bg-gradient-to-r from-[#632eaf]/5 to-[#88e04f]/5 border border-[#632eaf]/30 rounded-xl px-3 py-2.5 mb-5">
                            <div className="flex gap-1.5">
                                {Array.from({ length: plans.plus.classesTotal }).map((_, i) => (
                                    <ClassSlot
                                        key={i}
                                        filled={i < plans.plus.classesCount}
                                        icon={plans.plus.icon}
                                        accent={plans.plus.accent}
                                    />
                                ))}
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-[10px] text-[#632eaf] font-bold uppercase tracking-wider leading-none">
                                    Clases en vivo
                                </p>
                                <p className="text-sm font-black text-[#632eaf]">
                                    {plans.plus.classesCount}<span className="text-gray-400 font-medium">/{plans.plus.classesTotal} al mes</span>
                                </p>
                            </div>
                        </div>

                        {/* Features list */}
                        <motion.ul
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="flex flex-col gap-2 mb-5 flex-1"
                        >
                            {plans.plus.features.map((feature) => (
                                <motion.li
                                    key={feature}
                                    variants={featureVariants}
                                    className="flex items-start gap-2.5"
                                >
                                    <PixelCheck color="#632eaf" />
                                    <span className="text-xs md:text-sm text-gray-700 leading-snug font-medium">
                                        {feature}
                                    </span>
                                </motion.li>
                            ))}
                        </motion.ul>

                        {/* Price */}
                        <div className="mb-4">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl md:text-4xl font-black text-[#632eaf]">
                                    {plans.plus.price}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">{plans.plus.period}</span>
                                <span className="text-[10px] text-gray-400 ml-1">MXN</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <Link
                            href={plans.plus.ctaHref}
                            className="group w-full inline-flex items-center justify-center gap-2 bg-[#632eaf] hover:bg-[#4a1f8a] text-white px-5 py-3 rounded-full font-bold text-sm transition-colors shadow-md hover:shadow-lg"
                        >
                            {plans.plus.cta}
                            <PixelArrow color="#ffffff" />
                        </Link>
                    </motion.div>
                </div>

                {/* Footnote */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-xs text-white/80 mt-8"
                >
                    ¿Dudas? Agenda una <Link href="/portal-alumno/evaluacion" className="text-white font-bold hover:underline">evaluación gratuita</Link> antes de elegir.
                </motion.p>
            </div>
        </section>
    );
}
