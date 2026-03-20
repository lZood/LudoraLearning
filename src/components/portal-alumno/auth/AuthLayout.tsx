import React from 'react';
import Link from 'next/link';
import LudoraLogo from '@/components/LudoraLogo';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    imagePlaceholder?: string;
}

export default function AuthLayout({ children, title, subtitle, imagePlaceholder }: AuthLayoutProps) {
    const defaultPlaceholder = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070";

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] bg-[#fbfbf0]">
            {/* LADO IZQUIERDO (PC) - Oculto en móviles */}
            <div className="hidden lg:block relative overflow-hidden">
                <img
                    src={imagePlaceholder || defaultPlaceholder}
                    alt="Portal Alumno"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#0F5451]/10" />
            </div>

            {/* CONTENEDOR MÓVIL (Top section) - Solo visible en móviles */}
            <div className="lg:hidden w-full bg-[#0F5451] pt-12 pb-24 px-8 text-white relative">
                <Link href="/" className="mb-8 block">
                    <LudoraLogo className="h-8 w-auto fill-white opacity-90" />
                </Link>
                <h1 className="text-3xl font-black mb-2 leading-tight uppercase tracking-tight">
                    {title}
                </h1>
                <p className="text-emerald-50/80 font-medium text-sm">
                    {subtitle}
                </p>
            </div>

            {/* LADO DERECHO / TARJETA (Formulario) */}
            <div className={`
                flex flex-col items-center justify-start lg:justify-center 
                w-full mx-auto relative z-10
                lg:bg-transparent
                bg-white rounded-t-[40px] mt-[-40px] lg:mt-0 lg:rounded-none
                px-6 py-12 sm:py-16 lg:p-16
            `}>
                <div className="w-full max-w-md">
                    {/* Header (Solo PC) */}
                    <div className="mb-10 hidden lg:flex flex-col items-start">
                        <Link href="/" className="mb-12">
                            <LudoraLogo className="h-10 w-auto" />
                        </Link>
                        <h1 className="text-4xl font-black text-[#1a1a1a] mb-3 leading-tight uppercase tracking-tight">{title}</h1>
                        <p className="text-[#3a3a3a] text-lg font-medium opacity-70">{subtitle}</p>
                    </div>

                    {/* Contenido (Forms) */}
                    <div className="w-full">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
