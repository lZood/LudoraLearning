"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

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
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sofia&backgroundColor=b6e3f4",
        quote: "Antes no me gustaba el inglés, pero ahora es mi materia favorita. ¡Aprendí a decir todos los materiales de Minecraft en inglés sin darme cuenta!",
        rating: 5,
        accentColor: "text-[#8ED462]",
        accentBg: "bg-[#8ED462]/10",
    },
    {
        name: "Carlos R.",
        role: "Padre de alumno",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Carlos&backgroundColor=ffd5dc",
        quote: "Mi hijo pasó de no querer estudiar inglés a pedirme que lo inscriba en más clases. La metodología de Ludora cambió todo. Ahora habla con confianza.",
        rating: 5,
        accentColor: "text-[#86d2fb]",
        accentBg: "bg-[#86d2fb]/10",
    },
    {
        name: "Valentina P.",
        role: "Alumna · 9 años",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Valentina&backgroundColor=c0aede",
        quote: "Lo mejor es que juegas con otros niños y tienes que hablar en inglés para ganar las misiones. ¡Es como una aventura real!",
        rating: 5,
        accentColor: "text-[#a855f7]",
        accentBg: "bg-[#a855f7]/10",
    },
    {
        name: "Mamá de Diego",
        role: "Madre de alumno",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=MamaDiego&backgroundColor=ffd5dc",
        quote: "Diego mejoró su pronunciación muchísimo. La maestra Valeria tiene una paciencia increíble y hace que los niños se sientan cómodos hablando.",
        rating: 5,
        accentColor: "text-[#f59e0b]",
        accentBg: "bg-[#f59e0b]/10",
    },
    {
        name: "Mateo L.",
        role: "Alumno · 13 años",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Mateo&backgroundColor=b6e3f4",
        quote: "Pensé que iba a ser aburrido como la escuela, pero no. Aquí construyes cosas y aprendes vocabulario mientras juegas. Es completamente diferente.",
        rating: 5,
        accentColor: "text-[#10b981]",
        accentBg: "bg-[#10b981]/10",
    },
    {
        name: "Ana G.",
        role: "Madre de alumna",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=AnaG&backgroundColor=c0aede",
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
                    className={`w-4 h-4 ${i < count ? "text-[#f59e0b] fill-[#f59e0b]" : "text-gray-200"}`}
                />
            ))}
        </div>
    );
}

export default function StudentTestimonials() {
    return (
        <section className="relative w-full min-h-screen py-28 md:py-36 bg-[#e8e4d8] rounded-t-[50px] rounded-b-[50px] overflow-hidden flex items-center">
            {/* Decorative blobs */}
            <div className="absolute top-10 right-[-40px] w-72 h-72 bg-[#a855f7]/15 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-20 left-[-30px] w-64 h-64 bg-[#8ED462]/20 rounded-full blur-[70px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-[#86d2fb]/15 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <span className="inline-block bg-[#a855f7]/10 text-[#7c3aed] px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-[0.15em] mb-6">
                        💬 Voces de Nuestros Alumnos
                    </span>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#222222] tracking-tight leading-[1.05] mb-6">
                        Lo que dicen nuestros{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#7c3aed]">
                            jugadores
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-[#666666] font-medium max-w-2xl mx-auto leading-relaxed">
                        Historias reales de alumnos y padres que descubrieron una nueva forma de aprender inglés.
                    </p>
                </motion.div>

                {/* Testimonial Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                delay: i * 0.1,
                                duration: 0.6,
                                type: "spring",
                                bounce: 0.25,
                            }}
                            className="group bg-white rounded-[32px] p-8 md:p-10 flex flex-col shadow-[0_20px_60px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_25px_70px_rgb(0,0,0,0.08)] transition-all duration-500"
                        >
                            {/* Quote icon */}
                            <div className={`w-12 h-12 rounded-2xl ${t.accentBg} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                <Quote className={`w-6 h-6 ${t.accentColor}`} />
                            </div>

                            {/* Quote text */}
                            <p className="text-[#444444] text-base md:text-lg leading-relaxed font-medium flex-grow mb-8">
                                &ldquo;{t.quote}&rdquo;
                            </p>

                            {/* Rating */}
                            <div className="mb-5">
                                <StarRating count={t.rating} />
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <img
                                    src={t.avatar}
                                    alt={t.name}
                                    className="w-12 h-12 rounded-full bg-gray-100 object-cover"
                                />
                                <div>
                                    <p className="font-black text-[#222222] text-base">{t.name}</p>
                                    <p className="text-sm text-[#888888] font-medium">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
