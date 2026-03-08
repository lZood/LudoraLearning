import React from 'react';
import Link from 'next/link';

export default function PortalAlumnoSignIn() {
    return (
        <div className="min-h-[100dvh] w-full relative flex items-center justify-center font-sans overflow-x-hidden overflow-y-auto py-12">
            {/* Nether-inspired Background */}
            <div
                className="absolute inset-0 z-0 bg-[#361A27]"
                style={{
                    backgroundImage: `
            radial-gradient(circle at 40% 30%, rgba(55, 36, 73, 0.9) 0%, transparent 60%),
            radial-gradient(circle at 80% 80%, rgba(55, 36, 73, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 10% 90%, rgba(15, 115, 87, 0.15) 0%, transparent 40%)
          `,
                    filter: 'contrast(1.2) brightness(0.9)',
                }}
            >
                {/* Subtle animated particles/swirls simulating nether portal energy */}
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[pulse_8s_ease-in-out_infinite]" />
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-[420px] px-6">

                {/* Sign In Card */}
                <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-[#361A27]/50 border-t-4 border-[#0F5451]">

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Portal de Alumno</h1>
                        <p className="text-gray-500 text-sm">Ingresa para continuar tu aventura</p>
                    </div>

                    <form className="flex flex-col gap-5" action="/portal-alumno/dashboard">
                        {/* Google Sign In Button */}
                        <button
                            type="button"
                            className="flex items-center justify-center gap-3 w-full border-2 border-gray-200 rounded-xl py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-[#0F5451] focus:ring-offset-1"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                <path d="M1 1h22v22H1z" fill="none" />
                            </svg>
                            Continuar con Google
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-2">
                            <div className="h-px bg-gray-200 flex-1" />
                            <span className="text-sm text-gray-400 font-medium">o</span>
                            <div className="h-px bg-gray-200 flex-1" />
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="juan.perez@ejemplo.com"
                                className="w-full border-2 border-gray-200 rounded-xl py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#0F5451] focus:ring-0 outline-none transition-colors"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••••••"
                                className="w-full border-2 border-gray-200 rounded-xl py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#0F5451] focus:ring-0 outline-none transition-colors tracking-widest"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#0F5451] to-[#0F7357] hover:from-[#0b403d] hover:to-[#0a523e] text-white font-bold rounded-xl py-3.5 px-4 mt-2 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#0F5451]/30 focus:outline-none focus:ring-2 focus:ring-[#0F7357] focus:ring-offset-2"
                        >
                            Iniciar sesión
                        </button>
                    </form>

                    {/* Text Links */}
                    <div className="mt-8 flex flex-col items-center gap-3 text-sm">
                        <Link href="#" className="text-[#0F5451] font-medium hover:text-[#0F7357] hover:underline transition-colors">
                            Restablecer contraseña
                        </Link>
                        <div className="text-gray-500 mt-2">
                            ¿No tienes cuenta? <Link href="/portal-alumno/registro" className="text-[#0F5451] font-bold hover:text-[#0F7357] hover:underline transition-colors">Crea una cuenta</Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
