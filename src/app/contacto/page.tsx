"use client";

import React from "react";
import Hero from "@/components/Hero";
import HeroTransition from "@/components/HeroTransition";
import Footer from "@/components/Footer";
import { MessageCircle, Calendar, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactoPage() {
    return (
        <main className="min-h-screen bg-[#f5f1e4] relative text-[#1a1a1a]">

            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* WhatsApp Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-[32px] p-10 flex flex-col items-start shadow-xl border border-black/5 hover:scale-[1.02] transition-transform duration-300"
                    >
                        <div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mb-8">
                            <MessageCircle className="w-8 h-8 text-[#25D366]" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4">WhatsApp Directo</h3>
                        <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                            Resuelve tus dudas al instante. Chatea con nosotros para obtener información personalizada sobre cursos y metodología.
                        </p>
                        <a
                            href="https://wa.me/yourwhatsappnumber"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto group flex items-center gap-4 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#128C7E] transition-colors"
                        >
                            Escríbenos ahora
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </motion.div>

                    {/* Calendly Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[32px] p-10 flex flex-col items-start shadow-xl border border-black/5 hover:scale-[1.02] transition-transform duration-300"
                    >
                        <div className="w-16 h-16 bg-[#006BFF]/10 rounded-2xl flex items-center justify-center mb-8">
                            <Calendar className="w-8 h-8 text-[#006BFF]" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4">Agenda con Calendly</h3>
                        <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                            Elige el horario que mejor te convenga para una videollamada de asesoría gratuita de 15 minutos.
                        </p>
                        <a
                            href="https://calendly.com/yourlink"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto group flex items-center gap-4 bg-[#006BFF] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#0052cc] transition-colors"
                        >
                            Reservar espacio
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </motion.div>
                </div>

                {/* Info Empesa */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-black/10 pt-24">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <MapPin className="w-6 h-6 text-[#632eaf]" />
                            <h4 className="text-xl font-bold">Ubicación</h4>
                        </div>
                        <div className="text-neutral-600 space-y-1">
                            <p className="font-bold text-black opacity-100">Ciudad de México</p>
                            <p>Avenida Reforma 222,</p>
                            <p>Juárez, 06600 CDMX, México</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <Mail className="w-6 h-6 text-[#632eaf]" />
                            <h4 className="text-xl font-bold">Email</h4>
                        </div>
                        <div className="text-neutral-600">
                            <a href="mailto:hola@ludoralearning.com" className="hover:text-[#632eaf] transition-colors">
                                hola@ludoralearning.com
                            </a>
                            <p className="mt-2 text-sm opacity-60">Respondemos en menos de 24 horas.</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <Clock className="w-6 h-6 text-[#632eaf]" />
                            <h4 className="text-xl font-bold">Horarios</h4>
                        </div>
                        <div className="text-neutral-600 space-y-1">
                            <p>Lunes a Viernes</p>
                            <p className="font-bold text-black opacity-100">9:00 am - 6:00 pm (CST)</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
