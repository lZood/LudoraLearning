'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Eye, EyeOff, Info } from 'lucide-react';
import GoogleAuthButton from './GoogleAuthButton';

interface LoginFormProps {
    onSwitch: () => void;
}

export default function LoginForm({ onSwitch }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const translateError = (msg: string) => {
        if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.';
        if (msg.includes('Email not confirmed')) return 'Por favor, confirma tu correo electrónico antes de ingresar.';
        if (msg.includes('User not found')) return 'Usuario no encontrado.';
        if (msg.includes('Email link is invalid or has expired')) return 'El enlace ha expirado o no es válido.';
        return 'Ocurrió un error al intentar iniciar sesión. Inténtalo de nuevo.';
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(translateError(signInError.message));
                setIsLoading(false);
                return;
            }

            // Redirección condicionada por flujo de evaluación
            router.push('/portal-alumno/evaluacion');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al conectar con el servidor.');
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/portal-alumno/evaluacion`,
            },
        });
        if (error) setError(translateError(error.message));
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* CUADRO DE ALERTA (ESTILO DEEL) */}
            {error && (
                <div className="flex gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                        {error}
                    </p>
                </div>
            )}

            <form className="space-y-5 w-full" onSubmit={handleSignIn}>
                {/* CORREO ELECTRÓNICO */}
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider opacity-60">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="w-full bg-white border border-gray-200 rounded-xl py-4 px-5 text-[#1a1a1a] focus:border-[#0F5451] transition-all outline-none"
                        required
                    />
                </div>

                {/* CONTRASEÑA */}
                <div className="space-y-1.5">
                    <label htmlFor="password" className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider opacity-60">
                        Contraseña
                    </label>
                    <div className="relative group">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-5 pr-12 text-[#1a1a1a] focus:border-[#0F5451] transition-all outline-none tracking-widest"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F5451] transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* ¿OLVIDASTE TU CONTRASEÑA? */}
                <div className="text-left">
                    <button type="button" className="text-sm font-bold text-[#0F5451] hover:underline">
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                {/* BOTÓN DE ENTRAR */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1a1a1a] hover:bg-black text-white font-black text-lg rounded-xl py-4 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                    {isLoading ? 'Espera un momento...' : 'Entrar'}
                </button>
            </form>

            {/* IR A REGISTRO */}
            <p className="text-center text-gray-500 font-medium">
                ¿Aún no tienes cuenta?{' '}
                <button 
                  onClick={onSwitch}
                  className="text-[#0F5451] font-black hover:underline transition-colors"
                >
                    Regístrate
                </button>
            </p>

            {/* DIVISOR */}
            <div className="flex items-center gap-4 py-1">
                <div className="h-[1px] bg-gray-200 flex-1" />
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest px-2">o</span>
                <div className="h-[1px] bg-gray-200 flex-1" />
            </div>

            {/* BOTÓN DE GOOGLE */}
            <GoogleAuthButton onClick={handleGoogleSignIn} label="Entrar con Google" />
        </div>
    );
}
