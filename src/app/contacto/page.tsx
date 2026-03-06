"use client";

import React from "react";
import Footer from "@/components/Footer";
import { MessageCircle, Calendar, Mail, MapPin, Clock, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactoPage() {
    return (
        <main className="min-h-screen bg-[#f5f1e4] relative text-[#1a1a1a] overflow-hidden">

            {/* ── Blobs Decorativos ── */}
            <div className="absolute top-20 right-[-60px] w-72 h-72 bg-[#8ED462]/25 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-40 left-[-40px] w-80 h-80 bg-[#86d2fb]/20 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-[#a855f7]/15 rounded-full blur-[60px] pointer-events-none transform -translate-y-1/2" />
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#f59e0b]/15 rounded-full blur-[50px] pointer-events-none" />

            <section className="relative z-10 py-28 md:py-36 px-6 max-w-7xl mx-auto">

                {/* ── Encabezado ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                    className="text-center mb-20 md:mb-28"
                >
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 }}
                        className="inline-flex items-center gap-2 bg-[#a855f7]/10 text-[#7c3aed] px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-[0.15em] mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        Soporte &amp; Asesoría
                    </motion.span>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#222222] tracking-tight leading-[1.05] mb-6">
                        ¿Tienes dudas?{" "}
                        <br className="hidden md:block" />
                        Hablemos sobre{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ED462] to-[#4caf2e]">
                            Ludora
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-[#666666] font-medium max-w-2xl mx-auto leading-relaxed">
                        Estamos aquí para resolver cualquier pregunta. Elige el canal que prefieras y conecta con nuestro equipo.
                    </p>
                </motion.div>

                {/* ── Tarjetas de contacto principal ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-24 md:mb-32">

                    {/* WhatsApp Card */}
                    <motion.a
                        href="https://wa.me/yourwhatsappnumber"
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                        className="group bg-white rounded-[40px] p-10 md:p-12 flex flex-col items-start shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-white hover:shadow-[0_25px_70px_rgb(37,211,102,0.12)] transition-all duration-500 cursor-pointer"
                    >
                        <div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <MessageCircle className="w-8 h-8 text-[#25D366]" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black mb-4 text-[#222222]">WhatsApp Directo</h3>
                        <p className="text-lg text-[#666666] mb-10 leading-relaxed font-medium">
                            Resuelve tus dudas al instante. Chatea con nosotros para obtener información personalizada sobre cursos y metodología.
                        </p>
                        <span className="mt-auto flex items-center gap-4 bg-[#25D366] text-white px-8 py-5 rounded-[20px] font-black text-lg tracking-wide shadow-[0_8px_25px_0_rgba(37,211,102,0.4)] group-hover:shadow-[0_12px_35px_rgba(37,211,102,0.3)] group-hover:-translate-y-1 active:translate-y-1 transition-all duration-300">
                            Escríbenos ahora
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </motion.a>

                    {/* Calendly Card */}
                    <motion.a
                        href="https://calendly.com/yourlink"
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.6, type: "spring", bounce: 0.3 }}
                        className="group bg-white rounded-[40px] p-10 md:p-12 flex flex-col items-start shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-white hover:shadow-[0_25px_70px_rgb(0,107,255,0.12)] transition-all duration-500 cursor-pointer"
                    >
                        <div className="w-16 h-16 bg-[#006BFF]/10 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <Calendar className="w-8 h-8 text-[#006BFF]" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black mb-4 text-[#222222]">Agenda con Calendly</h3>
                        <p className="text-lg text-[#666666] mb-10 leading-relaxed font-medium">
                            Elige el horario que mejor te convenga para una videollamada de asesoría gratuita de 15 minutos.
                        </p>
                        <span className="mt-auto flex items-center gap-4 bg-[#006BFF] text-white px-8 py-5 rounded-[20px] font-black text-lg tracking-wide shadow-[0_8px_25px_0_rgba(0,107,255,0.4)] group-hover:shadow-[0_12px_35px_rgba(0,107,255,0.3)] group-hover:-translate-y-1 active:translate-y-1 transition-all duration-300">
                            Reservar espacio
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </motion.a>
                </div>

                {/* ── Isla de Información ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                    className="bg-white/60 backdrop-blur-md rounded-[40px] md:rounded-[50px] p-10 md:p-14 shadow-[0_20px_60px_rgb(0,0,0,0.04)] border border-white/80"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 md:divide-x md:divide-gray-200/60">

                        {/* Ubicación */}
                        <div className="md:px-10 first:md:pl-0 last:md:pr-0 flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-[#632eaf] mb-5 transition-transform duration-300 hover:scale-110 hover:rotate-3">
                                <MapPin size={26} strokeWidth={2.5} />
                            </div>
                            <h4 className="text-xl font-black text-[#222222] mb-3">Ubicación</h4>
                            <div className="text-[#666666] space-y-1 font-medium">
                                <p className="font-bold text-[#222222]">Ciudad de México</p>
                                <p>Avenida Reforma 222,</p>
                                <p>Juárez, 06600 CDMX, México</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="md:px-10 first:md:pl-0 last:md:pr-0 flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-[#3b82f6] mb-5 transition-transform duration-300 hover:scale-110 hover:rotate-3">
                                <Mail size={26} strokeWidth={2.5} />
                            </div>
                            <h4 className="text-xl font-black text-[#222222] mb-3">Email</h4>
                            <div className="text-[#666666] font-medium">
                                <a href="mailto:hola@ludoralearning.com" className="hover:text-[#632eaf] transition-colors font-bold">
                                    hola@ludoralearning.com
                                </a>
                                <p className="mt-2 text-sm opacity-70">Respondemos en menos de 24 horas.</p>
                            </div>
                        </div>

                        {/* Horarios */}
                        <div className="md:px-10 first:md:pl-0 last:md:pr-0 flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-[#f59e0b] mb-5 transition-transform duration-300 hover:scale-110 hover:rotate-3">
                                <Clock size={26} strokeWidth={2.5} />
                            </div>
                            <h4 className="text-xl font-black text-[#222222] mb-3">Horarios</h4>
                            <div className="text-[#666666] space-y-1 font-medium">
                                <p>Lunes a Viernes</p>
                                <p className="font-bold text-[#222222]">9:00 am – 6:00 pm (CST)</p>
                            </div>
                        </div>

                    </div>
                </motion.div>

            </section>

            <Footer />
        </main>
    );
}
