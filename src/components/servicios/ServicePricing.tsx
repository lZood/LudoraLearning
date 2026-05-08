"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

type Plan = {
    id: "basic" | "plus";
    name: string;
    tagline: string;
    price: string;
    period: string;
    classesCount: number;
    titleIcon: string;       // ícono del title bar (logo redondo)
    planIcon: string;        // ícono del trade slot derecho (L bubble)
    classIcon: string;
    currencyIcon: string;
    currencyQty: number;
    features: string[];
    cta: string;
    ctaHref: string;
};

const plans: Plan[] = [
    {
        id: "basic",
        name: "Ludora Estándar",
        tagline: "Ideal para aprender a tu ritmo",
        price: "$399",
        period: "/ mes",
        classesCount: 1,
        titleIcon: "/images/service-page/logoredondoverde.webp",
        planIcon: "/images/service-page/ludora_verde.webp",
        classIcon: "/images/service-page/swords.webp",
        currencyIcon: "/images/service-page/emerald.png",
        currencyQty: 4,
        features: [
            "Evaluación adaptativa con IA (5 categorías)",
            "Biblioteca de videos, material interactivo y quizzes",
            "Gamificación: ligas, XP, logros y leaderboards",
            "Reportes de progreso para padres",
            "Comunidad activa en Discord",
        ],
        cta: "EMPEZAR CON ESTÁNDAR",
        ctaHref: "/portal-alumno/registro?plan=basic",
    },
    {
        id: "plus",
        name: "Ludora Plus",
        tagline: "La experiencia completa",
        price: "$999",
        period: "/ mes",
        classesCount: 4,
        titleIcon: "/images/service-page/logoludoraredondo.webp",
        planIcon: "/images/service-page/ludora_plus_morado.webp",
        classIcon: "/images/service-page/swords.webp",
        currencyIcon: "/images/service-page/emerald.png",
        currencyQty: 10,
        features: [
            "Evaluación adaptativa con IA (5 categorías)",
            "Biblioteca de videos, material interactivo y quizzes",
            "Gamificación: ligas, XP, logros y leaderboards",
            "Reportes de progreso para padres",
            "Comunidad activa en Discord",
        ],
        cta: "ELEGIR LUDORA PLUS",
        ctaHref: "/portal-alumno/registro?plan=plus",
    },
];

/* ── Paleta por plan (verde brand para Estándar, morado para Plus) ── */
const palette = {
    basic: {
        accent: "#88e04f",        // verde brand (brillante)
        accentLight: "#88e04f",
        titleBar: "#88e04f",
        titleBarRing: "#88e04f",
        ctaBg: "#88e04f",
        ctaBgHover: "#a4ec6f",
        ringStrong: "ring-[#88e04f]/50",
        // Texto sobre superficies #88e04f (verde claro): dark green con sombra
        onAccentText: "#1a4d24",
    },
    plus: {
        accent: "#632eaf",
        accentLight: "#a86bff",
        titleBar: "#3d1f6b",
        titleBarRing: "#a86bff",
        ctaBg: "#632eaf",
        ctaBgHover: "#7a3ed0",
        ringStrong: "ring-[#a86bff]/40",
        onAccentText: "#ffffff",
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

/* ── Pixel check icon ── */
const PixelCheck = ({ color }: { color: string }) => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        className="shrink-0 mt-0.5"
        style={{ imageRendering: "pixelated" }}
    >
        <rect x="10" y="3" width="2" height="2" fill={color} />
        <rect x="8" y="5" width="2" height="2" fill={color} />
        <rect x="6" y="7" width="2" height="2" fill={color} />
        <rect x="4" y="9" width="2" height="2" fill={color} />
        <rect x="2" y="7" width="2" height="2" fill={color} />
    </svg>
);

/* ── Pixel arrow (right) ── */
const PixelArrow = ({ color = "#1d1d1b", size = 22 }: { color?: string; size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        className="shrink-0"
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

/* ── Slot redondeado (no más MC GUI cuadrado) ── */
const RoundedSlot = ({
    icon,
    qty,
    size = "lg",
    filled = true,
    pixelated = false,
    badgeBg,
    badgeColor,
}: {
    icon?: string;
    qty?: number;
    size?: "lg" | "sm";
    filled?: boolean;
    pixelated?: boolean;
    badgeBg?: string;
    badgeColor?: string;
}) => {
    const isLg = size === "lg";
    const dim = isLg ? "w-[68px] h-[68px]" : "w-10 h-10";
    const iconDim = isLg ? "w-12 h-12" : "w-7 h-7";
    const radius = isLg ? "rounded-2xl" : "rounded-xl";

    return (
        <div
            className={`
                relative ${dim} ${radius} flex items-center justify-center
                ${filled
                    ? "bg-white ring-1 ring-black/10 shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]"
                    : "bg-black/[0.04] ring-1 ring-dashed ring-black/10"
                }
            `}
        >
            {filled && icon && (
                <img
                    src={icon}
                    alt=""
                    className={`${iconDim} object-contain`}
                    style={pixelated ? { imageRendering: "pixelated" } : undefined}
                />
            )}
            {qty && qty > 1 && (
                <span
                    className="absolute -bottom-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-black flex items-center justify-center leading-none ring-2 ring-white"
                    style={{
                        backgroundColor: badgeBg ?? "#3a2820",
                        color: badgeColor ?? "#ffffff",
                    }}
                >
                    {qty}
                </span>
            )}
        </div>
    );
};

/* ── Botón pill con efecto press suave ── */
const PillButton = ({
    href,
    children,
    bg,
    bgHover,
    textColor = "#ffffff",
}: {
    href: string;
    children: React.ReactNode;
    bg: string;
    bgHover: string;
    textColor?: string;
}) => {
    return (
        <Link
            href={href}
            style={{ backgroundColor: bg, color: textColor }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = bgHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = bg)}
            className={`
                group relative inline-flex items-center justify-center gap-2.5 w-full
                px-5 py-3.5 rounded-full
                font-black text-xs md:text-sm tracking-wider
                shadow-[0_4px_0_rgba(60,40,15,0.22)]
                hover:-translate-y-0.5 hover:shadow-[0_6px_0_rgba(60,40,15,0.28)]
                active:translate-y-0 active:shadow-[0_2px_0_rgba(60,40,15,0.28)]
                transition-all duration-150
            `}
        >
            <span>{children}</span>
            <PixelArrow color={textColor} size={14} />
        </Link>
    );
};

/* ── Chip minimalista de "clases en vivo" ── */
const LiveClassChip = ({
    count,
    icon,
    accent,
    accentLight,
}: {
    count: number;
    icon: string;
    accent: string;
    accentLight: string;
}) => (
    <div
        className="inline-flex items-center gap-2.5 self-center rounded-full pl-1.5 pr-4 py-1.5 ring-1"
        style={{
            backgroundColor: `${accentLight}1a`, // 10% accent light bg
            borderColor: `${accent}40`,
            // @ts-expect-error css var fallback, ring color via inline style
            "--tw-ring-color": `${accent}33`,
        }}
    >
        <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accent}20` }}
        >
            <img
                src={icon}
                alt=""
                className="w-5 h-5 object-contain"
                style={{ imageRendering: "pixelated" }}
            />
        </div>
        <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black leading-none" style={{ color: accent }}>
                {count}
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#3a3a3a]/75 leading-none">
                {count === 1 ? "clase" : "clases"} en vivo · al mes
            </span>
        </div>
    </div>
);

/* ── Pricing card (versión rounded + cream) ── */
const PricingCard = ({ plan, isPopular = false }: { plan: Plan; isPopular?: boolean }) => {
    const p = palette[plan.id];
    const accent = p.accent;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
                duration: 0.5,
                delay: isPopular ? 0.1 : 0,
                type: "spring",
                bounce: 0.2,
            }}
            className="relative"
        >
            {/* "MÁS POPULAR" badge — pill rounded-full */}
            {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <div className="relative bg-[#3d1f6b] text-white text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.18em] shadow-lg overflow-hidden ring-1 ring-[#a86bff]/40">
                        <motion.span
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
                        />
                        <span className="relative">✦ MÁS POPULAR ✦</span>
                    </div>
                </div>
            )}

            {/* Outer card — cream + rounded */}
            <div
                className={`
                    relative overflow-hidden rounded-[32px] bg-[#f5f1e4]
                    shadow-[0_18px_45px_-12px_rgba(60,40,15,0.22)]
                    ring-2 ${p.ringStrong}
                `}
            >
                {/* Enchanted MC particles (Plus only) — solo partículas pixeladas */}
                {isPopular && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {Array.from({ length: 14 }).map((_, i) => {
                            // Variaciones para sentirse aleatorias pero deterministas
                            const sizes = [3, 4, 3, 5, 3, 4, 6, 3, 4, 3, 5, 4, 3, 4];
                            const colors = ["#d8b4ff", "#a86bff", "#e9d5ff", "#a86bff", "#d8b4ff", "#c9a3ff"];
                            const leftPct = (i * 7.3 + 4) % 96;
                            const size = sizes[i];
                            const color = colors[i % colors.length];
                            const duration = 3.2 + (i % 5) * 0.45;
                            const delay = (i * 0.32) % 4;
                            const drift = (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 4);

                            return (
                                <motion.span
                                    key={i}
                                    className="absolute"
                                    style={{
                                        left: `${leftPct}%`,
                                        bottom: -8,
                                        width: size,
                                        height: size,
                                        backgroundColor: color,
                                        // pixel-glow: 1px sólido + halo muy sutil
                                        boxShadow: `0 0 0 1px rgba(168,107,255,0.45), 0 0 4px rgba(168,107,255,0.55)`,
                                        imageRendering: "pixelated",
                                    }}
                                    animate={{
                                        y: [0, -240 - (i % 5) * 25, -380],
                                        opacity: [0, 1, 1, 0],
                                        x: [0, drift, 0, drift / 2],
                                    }}
                                    transition={{
                                        duration,
                                        repeat: Infinity,
                                        delay,
                                        ease: "linear",
                                        times: [0, 0.15, 0.85, 1],
                                    }}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Title bar */}
                <div
                    className="relative flex items-center justify-between gap-3 px-5 py-3"
                    style={{ backgroundColor: p.titleBar }}
                >
                    <h3
                        className="text-sm md:text-base font-black tracking-wider uppercase"
                        style={{
                            color: p.onAccentText,
                            textShadow:
                                p.onAccentText === "#ffffff"
                                    ? undefined
                                    : "0 1px 0 rgba(255,255,255,0.35)",
                        }}
                    >
                        {plan.name}
                    </h3>
                    <div className="shrink-0 w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-md ring-2 ring-white/60">
                        <img
                            src={plan.titleIcon}
                            alt=""
                            className="w-9 h-9 object-contain"
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="relative p-5 sm:p-6 md:p-7 flex flex-col gap-5">

                    {/* Tagline */}
                    <p className="text-center text-xs md:text-sm font-semibold text-[#3a3a3a]/70 -mt-1">
                        {plan.tagline}
                    </p>

                    {/* TRADE ROW */}
                    <div className="flex items-center justify-center gap-3 md:gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <RoundedSlot
                                icon={plan.currencyIcon}
                                qty={plan.currencyQty}
                                badgeBg={p.accent}
                                badgeColor={p.onAccentText}
                            />
                            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#3a3a3a]/60">
                                tu cambias
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5 -mt-3">
                            <PixelArrow color={accent} size={26} />
                            <span className="text-[9px] font-bold text-[#3a3a3a]/40 uppercase tracking-wider">por</span>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <RoundedSlot icon={plan.planIcon} />
                            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#3a3a3a]/60">
                                ludora
                            </span>
                        </div>
                    </div>

                    {/* Big price */}
                    <div className="text-center -mt-1">
                        <div className="inline-flex items-baseline gap-1">
                            <span
                                className="text-3xl md:text-4xl font-black"
                                style={{ color: accent }}
                            >
                                {plan.price}
                            </span>
                            <span className="text-xs text-[#3a3a3a] font-bold">{plan.period}</span>
                            <span className="text-[10px] text-[#3a3a3a]/60 ml-1">MXN</span>
                        </div>
                    </div>

                    {/* Divider con label */}
                    <div className="flex items-center gap-2.5">
                        <span className="h-px flex-1 bg-[#3a3a3a]/15" />
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a3a3a]/70">
                            tu inventario incluye
                        </span>
                        <span className="h-px flex-1 bg-[#3a3a3a]/15" />
                    </div>

                    {/* Features */}
                    <motion.ul
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="flex flex-col gap-2.5"
                    >
                        {plan.features.map((feature) => (
                            <motion.li
                                key={feature}
                                variants={featureVariants}
                                className="flex items-start gap-2.5"
                            >
                                <PixelCheck color={accent} />
                                <span className="text-xs md:text-sm text-[#1d1d1b] leading-snug font-medium">
                                    {feature}
                                </span>
                            </motion.li>
                        ))}
                    </motion.ul>

                    {/* Clases en vivo — chip minimalista */}
                    <div className="flex justify-center">
                        <LiveClassChip
                            count={plan.classesCount}
                            icon={plan.classIcon}
                            accent={p.accent}
                            accentLight={p.accentLight}
                        />
                    </div>

                    {/* CTA */}
                    <PillButton
                        href={plan.ctaHref}
                        bg={p.ctaBg}
                        bgHover={p.ctaBgHover}
                        textColor={p.onAccentText}
                    >
                        {plan.cta}
                    </PillButton>
                </div>
            </div>
        </motion.div>
    );
};

export default function ServicePricing() {
    return (
        <section className="relative w-full bg-[#86d2fb] rounded-[50px] overflow-hidden px-4 sm:px-6 py-16 md:py-24 min-h-screen flex flex-col justify-center">
            <div className="relative z-10 max-w-5xl mx-auto w-full">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.25 }}
                    className="text-center mb-12 md:mb-14"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.05] drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)]">
                        Elige tu <span className="text-[#632eaf]">plan</span>
                    </h2>
                    <p className="mt-3 text-sm md:text-base text-white/95 font-medium">
                        Sin permanencia. Cancela cuando quieras.
                    </p>
                </motion.div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 lg:gap-8 items-start">
                    <PricingCard plan={plans[0]} />
                    <PricingCard plan={plans[1]} isPopular />
                </div>

                {/* Footnote */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-xs md:text-sm text-white mt-10"
                >
                    ¿Dudas? Agenda una{" "}
                    <Link href="/portal-alumno/evaluacion" className="text-white font-black underline underline-offset-4 hover:text-[#fff8b8]">
                        evaluación gratuita
                    </Link>{" "}
                    antes de elegir.
                </motion.p>
            </div>
        </section>
    );
}
