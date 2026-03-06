"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Clock, Trophy, Heart } from "lucide-react";

interface StatItem {
    icon: React.ElementType;
    value: number;
    suffix: string;
    label: string;
    color: string;
    bg: string;
}

const stats: StatItem[] = [
    { icon: Users, value: 150, suffix: "+", label: "Alumnos Activos", color: "text-[#8ED462]", bg: "bg-[#8ED462]/10" },
    { icon: Clock, value: 2400, suffix: "+", label: "Horas de Clase", color: "text-[#86d2fb]", bg: "bg-[#86d2fb]/10" },
    { icon: Trophy, value: 500, suffix: "+", label: "Niveles Completados", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
    { icon: Heart, value: 98, suffix: "%", label: "Satisfacción", color: "text-[#ef4444]", bg: "bg-[#ef4444]/10" },
];

function AnimatedCounter({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target]);

    return (
        <span className="text-5xl md:text-6xl lg:text-7xl font-black text-[#222222] tracking-tighter tabular-nums">
            {count.toLocaleString()}{suffix}
        </span>
    );
}

export default function CommunityStats() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="relative w-full min-h-screen py-20 md:py-28 bg-[#e8e4d8] rounded-t-[50px] rounded-b-[50px] overflow-hidden flex items-center px-6">
            {/* Blobs */}
            <div className="absolute top-10 left-[-40px] w-64 h-64 bg-[#f59e0b]/15 rounded-full blur-[70px] pointer-events-none" />
            <div className="absolute bottom-10 right-[-40px] w-72 h-72 bg-[#8ED462]/20 rounded-full blur-[80px] pointer-events-none" />

            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                className="relative z-10 max-w-6xl mx-auto bg-white/60 backdrop-blur-md rounded-[40px] md:rounded-[50px] p-10 md:p-16 shadow-[0_20px_60px_rgb(0,0,0,0.04)] border border-white/80"
            >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12, duration: 0.5, type: "spring" }}
                            className="flex flex-col items-center text-center gap-4"
                        >
                            <div className={`w-16 h-16 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} transition-transform duration-300 hover:scale-110 hover:rotate-3`}>
                                <stat.icon size={28} strokeWidth={2.5} />
                            </div>
                            <AnimatedCounter target={stat.value} suffix={stat.suffix} inView={isInView} />
                            <p className="text-[#666666] font-bold text-sm md:text-base tracking-wide uppercase">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
