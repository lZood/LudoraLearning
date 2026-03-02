import React from "react";

export default function PhotoGallery() {
    return (
        <section className="relative w-full bg-[#e0dbce] rounded-t-[50px] rounded-b-[50px] py-24 md:py-32 overflow-hidden mb-12">
            <div className="max-w-[85vw] mx-auto">
                {/* Cuadrícula de fotos: 4 columnas en PC, 1 en móvil */}
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6 min-h-[600px] md:min-h-[850px]">

                    {/* Imagen 1: Grande a la Izquierda (Ocupa Col: 1 y 2, Fila: 1 y 2) */}
                    <div className="md:col-span-2 md:row-span-2 flex flex-col gap-3 group cursor-pointer">
                        <div className="w-full flex-grow relative rounded-[2rem] overflow-hidden min-h-[350px] md:min-h-[0]">
                            {/* Insignia / Ícono en laquina superior derecha */}
                            <div className="absolute top-6 right-6 z-10 bg-[#2ba0ff] p-3 rounded-full text-white shadow-lg">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                            </div>
                            <img
                                src="/images/photogallery/1Grande.png"
                                alt="Estudiantes sonriendo"
                                className="object-cover w-full h-full absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                        </div>
                        <p className="text-lg md:text-xl font-medium text-[#1d1d1b] leading-tight mt-1.5">
                            Cross-Border UX Research: Unifying Online<br className="hidden md:block" /> Grocery Shopping Across Latin America
                        </p>
                    </div>

                    {/* Imagen 2: Superior Derecha (Ocupa Col: 3 y 4, Fila: 1) */}
                    <div className="md:col-span-2 md:row-span-1 flex flex-col gap-3 group cursor-pointer mt-8 md:mt-0">
                        <div className="w-full flex-grow relative rounded-[2rem] overflow-hidden min-h-[250px] md:min-h-[0]">
                            <img
                                src="/images/photogallery/2Larga.png"
                                alt="Reunión de equipo en entorno global"
                                className="object-cover w-full h-full absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                        </div>
                        <p className="text-base md:text-lg font-medium text-[#1d1d1b] leading-tight mt-1.5">
                            Understanding Consumer Behaviour in the Middle East: Key Insights for Global Companies
                        </p>
                    </div>

                    {/* Imagen 3: Inferior Centro (Ocupa Col: 3, Fila: 2) */}
                    <div className="md:col-span-1 md:row-span-1 flex flex-col gap-3 group cursor-pointer mt-8 md:mt-0">
                        <div className="w-full flex-grow relative rounded-[2rem] overflow-hidden min-h-[250px] md:min-h-[0]">
                            {/* Tags sobre la imagen */}
                            <div className="absolute top-4 left-4 z-10 flex gap-2">
                                <span className="bg-white/90 backdrop-blur-sm text-[#1d1d1b] text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                                    Asia-Pacific
                                </span>
                                <span className="bg-white/90 backdrop-blur-sm text-[#1d1d1b] text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                                    Customer Insights
                                </span>
                            </div>
                            <img
                                src="/images/photogallery/3Cuadrada.png"
                                alt="Estudiante en ciudad asiática"
                                className="object-cover w-full h-full absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                        </div>
                        <p className="text-sm md:text-base font-medium text-[#1d1d1b] leading-tight mt-1.5">
                            Understanding East Asian Consumer Behaviour:<br />A Guide for Global Brands
                        </p>
                    </div>

                    {/* Imagen 4: Inferior Derecha (Ocupa Col: 4, Fila: 2) */}
                    <div className="md:col-span-1 md:row-span-1 flex flex-col gap-3 group cursor-pointer mt-8 md:mt-0">
                        <div className="w-full flex-grow relative rounded-[2rem] overflow-hidden min-h-[250px] md:min-h-[0]">
                            {/* Tags sobre la imagen */}
                            <div className="absolute top-4 left-4 z-10 flex gap-2">
                                <span className="bg-white/90 backdrop-blur-sm text-[#1d1d1b] text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                                    Middle East
                                </span>
                                <span className="bg-white/90 backdrop-blur-sm text-[#1d1d1b] text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                                    Case Studies
                                </span>
                            </div>
                            <img
                                src="/images/photogallery/4Cuadrada.png"
                                alt="Mercado medio oriental"
                                className="object-cover w-full h-full absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                        </div>
                        <p className="text-sm md:text-base font-medium text-[#1d1d1b] leading-tight mt-1.5">
                            Unlocking the Flavours of Egypt: A Journey into Seasoning Preferences
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
