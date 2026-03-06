import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { WigglyUnderline } from "./WigglyUnderline";

export default function Footer() {
    return (
        <footer className="relative w-full min-h-screen bg-[#632eaf] flex flex-col px-6 pt-16 pb-12 text-[#ffffff] rounded-t-[50px] rounded-b-[50px] overflow-hidden">
            <div className="w-full max-w-[85vw] mx-auto flex flex-col flex-grow justify-between">

                {/* Contenedor Principal a 2 Columnas */}
                <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 flex-grow">

                    {/* Columna Izquierda: Intro, Botón y Título Gigante */}
                    <div className="lg:w-1/2 flex flex-col justify-between py-6 lg:py-12">
                        <div className="flex flex-col gap-8">
                            <p className="text-lg md:text-xl font-medium leading-relaxed opacity-90 max-w-md">
                                ¿Tienes un objetivo en mente? Nos encantaría escuchar qué estás buscando y mostrarte cómo podemos ayudarte. Ya sea que estés explorando el inglés desde cero o busques dominar conversaciones avanzadas, estamos listos cuando tú lo estés.
                            </p>

                            <Link
                                href="/contacto"
                                className="group flex items-center relative rounded-xl bg-white shadow-xl overflow-hidden"
                                style={{ width: '300px', height: '56px' }}
                            >
                                {/* Icono a la izquierda */}
                                <div className="absolute left-2 bg-[#8ed462] rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                                    <ChevronRight className="w-5 h-5 text-[#1d1d1b]" strokeWidth={3} />
                                </div>

                                {/* Texto centrado visualmente hacia la izquierda */}
                                <span className="absolute left-6 font-semibold text-[#1d1d1b] text-lg transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] group-hover:translate-x-[48px]">
                                    Agenda tu clase!
                                </span>

                                {/* Icono a la derecha */}
                                <div className="absolute right-2 bg-[#8ed462] rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-100 opacity-100 group-hover:scale-0 group-hover:opacity-0">
                                    <ChevronRight className="w-5 h-5 text-[#1d1d1b]" strokeWidth={3} />
                                </div>
                            </Link>
                        </div>

                        {/* Título Gigante movido a la parte inferior de la columna izquierda */}
                        <h2 className="text-[12vw] lg:text-[8vw] xl:text-[7vw] leading-[0.9] font-bold tracking-tighter mt-16 lg:mt-0">
                            Craft your <br />
                            <span className="inline-block pt-4">
                                <WigglyUnderline color="#88e04f" speed="3s" thickness="20px" scaleX="2.5">
                                    English
                                </WigglyUnderline>
                            </span>
                        </h2>
                    </div>

                    {/* Columna Derecha: Enlaces y Contacto */}
                    <div className="lg:w-1/2 flex flex-col gap-16 py-6 lg:py-12">

                        {/* Fila de Enlaces */}
                        <div className="grid grid-cols-2 gap-8 text-base md:text-lg font-medium">
                            <div className="flex flex-col gap-3">
                                <Link href="/servicios" className="hover:opacity-60 transition-opacity">Servicios</Link>
                                <Link href="/Estrategia" className="hover:opacity-60 transition-opacity">Estrategia</Link>
                                <Link href="/niveles" className="hover:opacity-60 transition-opacity">Niveles Disponibles</Link>
                                <Link href="/edades" className="hover:opacity-60 transition-opacity">Edades</Link>
                                <Link href="/nosotros" className="hover:opacity-60 transition-opacity">Sobre Nosotros</Link>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Link href="/logros" className="hover:opacity-60 transition-opacity">Logros</Link>
                                <Link href="/contacto" className="hover:opacity-60 transition-opacity">Contacto</Link>
                                <Link href="/privacidad" className="hover:opacity-60 transition-opacity">Política de Privacidad</Link>
                                <Link href="/cookies" className="hover:opacity-60 transition-opacity">Preferencias de Cookies</Link>
                            </div>
                        </div>

                        {/* Fila de Ubicaciones / Info de contacto */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm md:text-base font-medium opacity-80 lg:mt-auto">
                            <div>
                                <p className="font-bold mb-1 opacity-100">Ciudad de México</p>
                                <p>Avenida Reforma 222,</p>
                                <p>Juárez, 06600 CDMX, México</p>
                                <p>Lun-Vie 9:00 am - 6:00 pm (CST)</p>
                            </div>
                            <div className="flex flex-col justify-between">
                                <div>
                                    <p className="font-bold mb-1 opacity-100">Madrid</p>
                                    <p>Gran Vía 28, 5º Planta,</p>
                                    <p>28013 Madrid, España</p>
                                    <p>Lun-Vie 10:00 am - 7:00 pm (CET)</p>
                                </div>
                                <Link href="mailto:hola@ludoralearning.com" className="font-bold lg:mt-6 hover:underline mt-4 opacity-100">
                                    hola@ludoralearning.com
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fila legal (Copyright & Redes Sociales) */}
                <div className="flex flex-col md:flex-row justify-between items-center text-sm font-semibold border-t border-[#1d1d1b]/20 pt-6 mt-8">
                    <p>Copyright © 2026 Ludora Learning</p>
                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                        <span className="opacity-50 line-through">LUDORA</span>
                        <Link href="https://linkedin.com" target="_blank" className="hover:opacity-60 transition-opacity">
                            LinkedIn
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
