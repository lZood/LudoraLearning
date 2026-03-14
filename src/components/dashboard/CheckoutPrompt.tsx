"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";
import Link from "next/link";

export default function CheckoutPrompt() {
    const [isYearly, setIsYearly] = useState(true);

    const handleCheckout = async () => {
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // TODO: Replace with actual Stripe Price IDs based on isYearly state
                    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_1T8WrO0qbWrTcjOehklKiW9X',
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(errorData.error || 'Ocurrió un error al procesar el pago.');
                return;
            }

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('No se pudo conectar con el sistema de pagos.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4 sm:p-8 font-sans">
            {/* Contenedor Principal con estilo marco de madera */}
            <div className="w-full max-w-[950px] mx-auto bg-[#c5a676] p-[6px] border-[4px] border-[#1a1a1a] relative shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
                {/* Esquinas decorativas del marco (esquinas oscuras) */}
                <div className="absolute top-0 left-0 w-[14px] h-[14px] bg-[#6e4e31] border-[2px] border-[#1a1a1a] z-20"></div>
                <div className="absolute top-0 right-0 w-[14px] h-[14px] bg-[#6e4e31] border-[2px] border-[#1a1a1a] z-20"></div>
                <div className="absolute bottom-0 left-0 w-[14px] h-[14px] bg-[#6e4e31] border-[2px] border-[#1a1a1a] z-20"></div>
                <div className="absolute bottom-0 right-0 w-[14px] h-[14px] bg-[#6e4e31] border-[2px] border-[#1a1a1a] z-20"></div>

                {/* Contenido interior */}
                <div className="flex flex-col md:flex-row border-[4px] border-[#1a1a1a] bg-[#313131] h-auto md:min-h-[500px]">
                    
                    {/* Imagen lado izquierdo */}
                    <div className="w-full md:w-[45%] border-b-[4px] md:border-b-0 md:border-r-[4px] border-[#1a1a1a] relative group overflow-hidden">
                        <div className="absolute inset-0 border-t-[3px] border-l-[3px] border-white/20 z-10 pointer-events-none"></div>
                        <div className="absolute inset-0 border-b-[3px] border-r-[3px] border-black/40 z-10 pointer-events-none"></div>
                        <Image 
                            src="/images/home/BG_Near.png" 
                            alt="Fondo Paisaje" 
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Filtro naranja suave para atardecer */}
                        <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay z-0 pointer-events-none"></div>
                    </div>

                    {/* Lado derecho con info y pago */}
                    <div className="flex-1 p-6 sm:p-8 relative">
                        {/* Biselado interior panel gris */}
                        <div className="absolute inset-0 border-t-[3px] border-l-[3px] border-[#5a5a5a] z-0 pointer-events-none"></div>
                        <div className="absolute inset-0 border-b-[3px] border-r-[3px] border-[#181818] z-0 pointer-events-none"></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            {/* Botón cerrar */}
                            <Link href="/">
                                <button className="absolute -top-2 -right-3 text-[#aaaaaa] hover:text-white transition-colors cursor-pointer">
                                    <X strokeWidth={3} className="w-8 h-8" />
                                </button>
                            </Link>
                            
                            {/* Toggle Switch */}
                            <div className="mx-auto w-[90%] sm:w-[80%] max-w-[280px] mb-8 mt-2">
                                <div className="flex w-full bg-[#1a1a1a] p-[3px] rounded-sm">
                                    <button 
                                        onClick={() => setIsYearly(true)}
                                        className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-center border-[2px] transition-colors
                                            ${isYearly 
                                                ? 'bg-[#5c5c5c] text-white border-t-[#8c8c8c] border-l-[#8c8c8c] border-b-[#3c3c3c] border-r-[#3c3c3c]' 
                                                : 'bg-transparent text-[#9e9e9e] border-transparent hover:text-[#d1d1d1]'}`}
                                    >
                                        Anual (Ahorra 20%)
                                    </button>
                                    <button 
                                        onClick={() => setIsYearly(false)}
                                        className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-center border-[2px] transition-colors
                                            ${!isYearly 
                                                ? 'bg-[#5c5c5c] text-white border-t-[#8c8c8c] border-l-[#8c8c8c] border-b-[#3c3c3c] border-r-[#3c3c3c]' 
                                                : 'bg-transparent text-[#9e9e9e] border-transparent hover:text-[#d1d1d1]'}`}
                                    >
                                        Mensual
                                    </button>
                                </div>
                            </div>

                            {/* Textos Principales */}
                            <div className="text-center mb-6">
                                <h2 className="text-2xl sm:text-[26px] leading-[1.2] font-bold mb-3 tracking-wide text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                                    Mejora a Pro Builder para Acceso Total
                                </h2>
                                <p className="text-xl sm:text-2xl text-[#c2c2c2] drop-shadow-[1.5px_1.5px_0_rgba(0,0,0,1)] font-semibold">
                                    {isYearly ? "$12/mes" : "$15/mes"}
                                </p>
                            </div>

                            {/* Lista de Características */}
                            <div className="space-y-3 sm:space-y-4 mb-10 flex-1">
                                {[
                                    "Desbloquea 100+ Quests en Inglés",
                                    "Acceso a mundos survival exclusivos",
                                    "Tutoría en vivo durante el juego",
                                    "Skins de personajes personalizados",
                                    "Reportes de progreso mensuales"
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="bg-[#46a035] rounded-full p-[2px] border-2 border-[#1a1a1a] flex-shrink-0 shadow-[inset_1px_1px_0_#98d654]">
                                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]" strokeWidth={5} />
                                        </div>
                                        <span className="text-[15px] sm:text-[17px] text-[#e0e0e0] drop-shadow-[1px_1px_0_rgba(0,0,0,1)] leading-tight">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Botón Call to Action Minecraft */}
                            <button
                                onClick={handleCheckout}
                                className="w-full relative flex flex-col items-stretch overflow-hidden border-[3px] border-[#111111] group active:scale-[0.98] transition-all focus:outline-none shadow-lg mt-auto"
                            >
                                {/* Mitad arriba Pasto */}
                                <div className="bg-[#59ab38] pt-3 pb-2 sm:pt-4 sm:pb-3 flex items-center justify-center 
                                                border-t-[3px] border-l-[3px] border-[#81d85d] 
                                                border-r-[3px] border-[#397221] group-hover:bg-[#6bd642] transition-colors relative">
                                    <span className="text-white font-bold text-lg sm:text-xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.85)] z-10">
                                        ¡Hazte con la Aventura Ahora!
                                    </span>
                                    {/* Unos "puntos" sutiles para textura de pasto */}
                                    <div className="absolute top-1 left-2 w-1.5 h-1.5 bg-[#4f9c31]"></div>
                                    <div className="absolute top-3 right-4 w-1 h-1 bg-[#7deb5a]"></div>
                                    <div className="absolute bottom-2 left-6 w-1 h-1 bg-[#4f9c31]"></div>
                                </div>
                                {/* Mitad abajo Tierra */}
                                <div className="h-4 sm:h-5 bg-[#6c4c34] border-b-[3px] border-r-[3px] border-[#422e1e] border-l-[3px] border-[#8e6545] relative">
                                    <div className="absolute top-1 left-3 w-1.5 h-1.5 bg-[#4e3623]"></div>
                                    <div className="absolute top-0 right-5 w-1 h-1 bg-[#865f42]"></div>
                                </div>
                            </button>

                            {/* Enlace ver planes */}
                            <div className="mt-5 text-center">
                                <Link href="#" className="text-sm font-semibold text-[#a8a8a8] border-b border-[#a8a8a8] hover:text-white hover:border-white pb-0.5 transition-colors drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
                                    Ver todos los planes y características
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

