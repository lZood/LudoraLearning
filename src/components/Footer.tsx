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

                    {/* Columna Izquierda: Links + Título Gigante */}
                    <div className="lg:w-1/2 flex flex-col justify-between py-6 lg:py-12">
                        <div className="flex flex-col gap-10">
                            {/* Accesos directos */}
                            <div className="grid grid-cols-2 gap-8 text-base md:text-lg font-medium">
                                <div className="flex flex-col gap-3">
                                    <Link href="/#metodologia" className="hover:opacity-60 transition-opacity">Metodología</Link>
                                    <Link href="/#comunidad" className="hover:opacity-60 transition-opacity">Comunidad</Link>
                                    <Link href="/#faq" className="hover:opacity-60 transition-opacity">FAQ</Link>
                                    <Link href="/#precios" className="hover:opacity-60 transition-opacity">Precios</Link>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Link href="/portal" className="hover:opacity-60 transition-opacity">Portal de Alumnos</Link>
                                    <Link href="/contacto" className="hover:opacity-60 transition-opacity">Contacto</Link>
                                    <Link href="https://discord.gg/6SzMn3EqsV" target="_blank" className="hover:opacity-60 transition-opacity">Discord</Link>
                                    <Link href="/privacidad" className="hover:opacity-60 transition-opacity">Política de Privacidad</Link>
                                </div>
                            </div>

                            {/* Redes sociales */}
                            <div className="flex items-center gap-6">
                                <Link href="https://instagram.com/ludoralearning" target="_blank" className="hover:opacity-60 hover:scale-110 transition-all" aria-label="Instagram">
                                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                    </svg>
                                </Link>
                                <Link href="https://youtube.com/@ludoralearning" target="_blank" className="hover:opacity-60 hover:scale-110 transition-all" aria-label="YouTube">
                                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                                        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </Link>
                                <Link href="https://discord.gg/6SzMn3EqsV" target="_blank" className="hover:opacity-60 hover:scale-110 transition-all" aria-label="Discord">
                                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                                    </svg>
                                </Link>
                                <Link href="https://tiktok.com/@ludora.learning" target="_blank" className="hover:opacity-60 hover:scale-110 transition-all" aria-label="TikTok">
                                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                    </svg>
                                </Link>
                                <Link href="https://wa.me/message" target="_blank" className="hover:opacity-60 hover:scale-110 transition-all" aria-label="WhatsApp">
                                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                        {/* Título Gigante */}
                        <h2 className="text-[12vw] lg:text-[8vw] xl:text-[7vw] leading-[0.9] font-bold tracking-tighter mt-16 lg:mt-0">
                            Craft your <br />
                            <span className="inline-block pt-4">
                                <WigglyUnderline color="#88e04f" speed="3s" thickness="20px" scaleX="2.5">
                                    English
                                </WigglyUnderline>
                            </span>
                        </h2>
                    </div>

                    {/* Columna Derecha: Mensaje alumnos + botón + mensaje maestros */}
                    <div className="lg:w-1/2 flex flex-col gap-10 py-6 lg:py-12">

                        {/* Mensaje para alumnos */}
                        <div className="flex flex-col gap-6">
                            <p className="text-lg md:text-xl font-medium leading-relaxed opacity-90 max-w-lg">
                                Agenda una sesión gratuita donde podrás conocer tu nivel, probar nuestra metodología y ver cómo es aprender inglés en un entorno interactivo, dinámico y pensado para que realmente uses el idioma.
                            </p>

                            <Link
                                href="/portal-alumno"
                                className="group flex items-center relative rounded-xl bg-white shadow-xl overflow-hidden"
                                style={{ width: '300px', height: '56px' }}
                            >
                                <div className="absolute left-2 bg-[#8ed462] rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                                    <ChevronRight className="w-5 h-5 text-[#1d1d1b]" strokeWidth={3} />
                                </div>
                                <span className="absolute left-6 font-semibold text-[#1d1d1b] text-lg transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] group-hover:translate-x-[48px]">
                                    Inicia tu aventura!
                                </span>
                                <div className="absolute right-2 bg-[#8ed462] rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-100 opacity-100 group-hover:scale-0 group-hover:opacity-0">
                                    <ChevronRight className="w-5 h-5 text-[#1d1d1b]" strokeWidth={3} />
                                </div>
                            </Link>
                        </div>

                        {/* Separador */}
                        <div className="w-full h-px bg-white/15" />

                        {/* Mensaje para maestros */}
                        <div className="flex flex-col gap-4">
                            <p className="text-4xl md:text-5xl lg:text-6xl font-black text-[#ffffff] tracking-wide uppercase">Trabaja con nosotros</p>
                            <p className="text-base text-white/75 leading-relaxed max-w-lg">
                                En Ludora buscamos maestros que quieran ir más allá de la enseñanza tradicional y conectar con sus alumnos a través del juego, la interacción y experiencias reales dentro de Minecraft.
                            </p>
                            <p className="text-base text-white/75 leading-relaxed max-w-lg">
                                Si te apasiona enseñar, te gusta innovar y te encantan los videojuegos, puedes formar parte de nuestro proyecto en crecimiento. ¡Queremos conocerte!
                            </p>
                            <Link
                                href="/contacto"
                                className="group flex items-center relative rounded-xl bg-white shadow-xl overflow-hidden"
                                style={{ width: '300px', height: '56px' }}
                            >
                                <div className="absolute left-2 bg-[#8ed462] rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                                    <ChevronRight className="w-5 h-5 text-[#1d1d1b]" strokeWidth={3} />
                                </div>
                                <span className="absolute left-6 font-semibold text-[#1d1d1b] text-lg transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] group-hover:translate-x-[48px]">
                                    Únete al equipo!
                                </span>
                                <div className="absolute right-2 bg-[#8ed462] rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] z-10 scale-100 opacity-100 group-hover:scale-0 group-hover:opacity-0">
                                    <ChevronRight className="w-5 h-5 text-[#1d1d1b]" strokeWidth={3} />
                                </div>
                            </Link>
                        </div>

                    </div>
                </div>

                {/* Fila legal */}
                <div className="flex flex-col md:flex-row justify-between items-center text-sm font-semibold border-t border-white/20 pt-6 mt-8">
                    <p>Copyright © 2026 Ludora Learning</p>
                    <Link href="mailto:ludoralearning@gmail.com" className="hover:underline mt-2 md:mt-0">ludoralearning@gmail.com</Link>
                </div>
            </div>
        </footer>
    );
}
