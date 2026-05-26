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

    // Cuando no hay título (modo login) usamos una sola columna centrada, sin imagen.
    const isCentered = !title;

    return (
        <div className={`min-h-screen bg-[#f5f1e4] ${isCentered ? 'flex items-center justify-center' : 'grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]'}`}>
            {/* LADO IZQUIERDO (PC) - Solo cuando hay título (register/verification) */}
            {!isCentered && (
                <div className="hidden lg:block relative overflow-hidden">
                    <img
                        src={imagePlaceholder || defaultPlaceholder}
                        alt="Portal Alumno"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#0F5451]/10" />
                </div>
            )}

            {/* CONTENEDOR MÓVIL (Top section) - Solo cuando hay título e imagen detrás */}
            {!isCentered && (
                <div className="lg:hidden w-full bg-[#f5f1e4] pt-12 pb-24 px-8 relative">
                    <Link href="/" className="mb-8 block">
                        <LudoraLogo className="h-8 w-auto fill-[#1a1a1a] opacity-90" />
                    </Link>
                    <h1 className="text-3xl font-black text-[#1a1a1a] mb-2 leading-tight uppercase tracking-tight">
                        {title}
                    </h1>
                    <p className="text-[#1a1a1a]/70 font-medium text-sm">
                        {subtitle}
                    </p>
                </div>
            )}

            {/* TARJETA / FORMULARIO */}
            <div className={`
                flex flex-col items-center w-full
                ${isCentered
                    ? 'justify-center px-6 py-12 sm:py-16'
                    : 'justify-start lg:justify-center mx-auto relative z-10 lg:bg-transparent bg-[#f5f1e4] rounded-t-[40px] mt-[-40px] lg:mt-0 lg:rounded-none px-6 py-12 sm:py-16 lg:p-16'
                }
            `}>
                <div className="w-full max-w-md">
                    {/* Logo + Header */}
                    <div className={`flex flex-col ${isCentered ? 'items-center mb-8' : 'hidden lg:flex items-start mb-10'}`}>
                        <Link href="/" className={isCentered ? 'mb-6' : 'mb-12'}>
                            <LudoraLogo className="h-10 w-auto" />
                        </Link>
                        {title && (
                            <>
                                <h1 className="text-4xl font-black text-[#1a1a1a] mb-3 leading-tight uppercase tracking-tight">{title}</h1>
                                <p className="text-[#3a3a3a] text-lg font-medium opacity-70">{subtitle}</p>
                            </>
                        )}
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
