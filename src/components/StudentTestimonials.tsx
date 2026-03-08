"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { WigglyUnderline } from "@/components/WigglyUnderline";

interface Testimonial {
    name: string;
    role: string;
    avatar: string;
    quote: string;
    rating: number;
    accentColor: string;
    accentBg: string;
}

const testimonials: Testimonial[] = [
    {
        name: "Sofía M.",
        role: "Alumna · 11 años",
        avatar: "https://minotar.net/armor/bust/MHF_Alex/100.png",
        quote: "Antes no me gustaba el inglés, pero ahora es mi materia favorita. ¡Aprendí a decir todos los materiales de Minecraft en inglés sin darme cuenta!",
        rating: 5,
        accentColor: "text-[#8ED462]",
        accentBg: "bg-[#8ED462]/10",
    },
    {
        name: "Carlos R.",
        role: "Padre de alumno",
        avatar: "https://minotar.net/armor/bust/MHF_Steve/100.png",
        quote: "Mi hijo pasó de no querer estudiar inglés a pedirme que lo inscriba en más clases. La metodología de Ludora cambió todo. Ahora habla con confianza.",
        rating: 5,
        accentColor: "text-[#86d2fb]",
        accentBg: "bg-[#86d2fb]/10",
    },
    {
        name: "Valentina P.",
        role: "Alumna · 9 años",
        avatar: "https://minotar.net/armor/bust/MHF_Villager/100.png",
        quote: "Lo mejor es que juegas con otros niños y tienes que hablar en inglés para ganar las misiones. ¡Es como una aventura real!",
        rating: 5,
        accentColor: "text-[#a855f7]",
        accentBg: "bg-[#a855f7]/10",
    },
    {
        name: "Mamá de Diego",
        role: "Madre de alumno",
        avatar: "https://minotar.net/armor/bust/MHF_Pig/100.png",
        quote: "Diego mejoró su pronunciación muchísimo. La maestra Valeria tiene una paciencia increíble y hace que los niños se sientan cómodos hablando.",
        rating: 5,
        accentColor: "text-[#f59e0b]",
        accentBg: "bg-[#f59e0b]/10",
    },
    {
        name: "Mateo L.",
        role: "Alumno · 13 años",
        avatar: "https://minotar.net/armor/bust/MHF_Enderman/100.png",
        quote: "Pensé que iba a ser aburrido como la escuela, pero no. Aquí construyes cosas y aprendes vocabulario mientras juegas. Es completamente diferente.",
        rating: 5,
        accentColor: "text-[#10b981]",
        accentBg: "bg-[#10b981]/10",
    },
    {
        name: "Ana G.",
        role: "Madre de alumna",
        avatar: "https://minotar.net/armor/bust/MHF_Cow/100.png",
        quote: "Mi hija ahora ve videos en inglés por su cuenta. Ludora le dio la confianza que necesitaba. Ya no le da pena equivocarse, y eso es invaluable.",
        rating: 5,
        accentColor: "text-[#ef4444]",
        accentBg: "bg-[#ef4444]/10",
    },
];

function StarRating({ count }: { count: number }) {
    return (
        <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-5 h-5 ${i < count ? "text-[#f9d314] fill-[#f9d314]" : "text-gray-200"}`}
                />
            ))}
        </div>
    );
}

const MarqueeItem = ({ t }: { t: Testimonial }) => {
    return (
        <div className="w-[350px] md:w-[450px] h-full flex-shrink-0 bg-white/90 backdrop-blur-md rounded-[40px] p-8 md:p-10 flex flex-col shadow-[0_20px_60px_rgb(0,0,0,0.08)] border-4 border-white/50 mx-4 md:mx-6 transition-transform hover:scale-[1.02]">
            {/* Header: Avatar, Name & Rating */}
            <div className="flex items-center gap-6 mb-8">
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-[25px] overflow-hidden bg-[#e8e4d8] border-4 border-white shadow-xl flex-shrink-0">
                    <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-full h-full object-cover scale-110"
                    />
                </div>
                <div>
                    <h3 className="font-black text-[#222222] text-xl md:text-2xl mb-1">{t.name}</h3>
                    <p className="text-[#888888] font-bold text-sm md:text-base uppercase tracking-wider mb-2">{t.role}</p>
                    <StarRating count={t.rating} />
                </div>
            </div>

            {/* Quote icon */}
            <div className={`w-14 h-14 rounded-full ${t.accentBg} flex items-center justify-center mb-6`}>
                <Quote className={`w-7 h-7 ${t.accentColor}`} />
            </div>

            {/* Quote text */}
            <p className="text-[#444444] text-lg md:text-xl font-medium leading-[1.6]">
                &ldquo;{t.quote}&rdquo;
            </p>
        </div>
    );
}

export default function StudentTestimonials() {
    const baseVelocity = -1; // Negative for left movement
    const baseX = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Duplicate the array to ensure seamless looping
    const displayTestimonials = [...testimonials, ...testimonials, ...testimonials, ...testimonials];

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.scrollWidth / 2); // Assuming we duplicated array 4 times, half is enough to loop smoothly if we reset at proper point, actually scrollWidth is for the whole thing.
        }
    }, [containerRef.current]); // Added missing dependency for useEffect, containerRef.current should trigger a re-render. Actually useRef doesn't, but works fine for initial load here.

    // Re-calculate on resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.scrollWidth / 2);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useAnimationFrame((t, delta) => {
        if (isPaused || isDragging) return;

        let moveBy = baseVelocity * (delta / 16);

        let currentX = baseX.get();
        currentX += moveBy;

        // Reset X to loop seamlessly
        // We have 4 sets of testimonials. When we've scrolled past 2 sets (half the total width), reset to 0.
        if (containerWidth > 0 && Math.abs(currentX) >= containerWidth / 2) {
            currentX = 0;
        }

        baseX.set(currentX);
    });

    const x = useTransform(baseX, (v) => `${v}px`);

    return (
        <section className="relative w-full min-h-screen py-24 md:py-32 bg-[#88e04f] rounded-[50px] overflow-hidden flex flex-col justify-center">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute top-10 left-10 w-96 h-96 bg-white/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full mb-16 md:mb-24 px-6 md:px-12 text-center">
                <h2 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-[#222222] tracking-tight leading-[0.95]">
                    Lo que dicen nuestros <br className="hidden md:block" />
                    <span className="text-white drop-shadow-md">
                        <WigglyUnderline color="#ffffff" thickness="8px">jugadores</WigglyUnderline>
                    </span>
                </h2>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden py-10">
                <motion.div
                    ref={containerRef}
                    className="flex w-max cursor-grab active:cursor-grabbing"
                    style={{ x }}
                    drag="x"
                    dragConstraints={{ left: -containerWidth, right: 0 }}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {displayTestimonials.map((t, idx) => (
                        <MarqueeItem key={idx} t={t} />
                    ))}
                </motion.div>
            </div>

            <style jsx global>{`
                /* Hide scrollbar for the marquee container just in case */
                ::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
