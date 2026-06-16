'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Eye, EyeOff, Info } from 'lucide-react';
import GoogleAuthButton from './GoogleAuthButton';

interface LoginFormProps {
    onSwitch: () => void;
}

const VERIFY_ERROR_MESSAGES: Record<string, string> = {
    verify_expired: 'El enlace de confirmación expiró. Regístrate o pide un nuevo código.',
    verify_failed: 'No pudimos confirmar tu correo. Solicita un nuevo enlace.',
    verify_missing_params: 'El enlace de confirmación no es válido.',
};

export default function LoginForm({ onSwitch }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<{ message: string; field: 'email' | 'password' | 'general' | null }>({ message: '', field: null });
    const [notice, setNotice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Reset de contraseña: usa el correo ya escrito arriba y dispara el enlace por Resend.
    const handleForgotPassword = async () => {
        setNotice('');
        setError({ message: '', field: null });
        if (!email) {
            setError({ message: 'Escribe tu correo arriba y te enviaremos un enlace para restablecer tu contraseña.', field: 'email' });
            return;
        }
        try {
            await fetch('/api/auth/reset-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
        } catch { /* respuesta uniforme abajo (anti-enumeración) */ }
        setNotice(`Si existe una cuenta con ${email}, te enviamos un enlace para restablecer tu contraseña.`);
    };

    // Si /auth/confirm falló y redirigió con ?error=..., mostramos el mensaje.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const errCode = params.get('error');
        if (errCode && VERIFY_ERROR_MESSAGES[errCode]) {
            setError({ message: VERIFY_ERROR_MESSAGES[errCode], field: 'general' });
            // Limpia el querystring para que no quede pegado al recargar.
            const url = new URL(window.location.href);
            url.searchParams.delete('error');
            window.history.replaceState({}, '', url.toString());
        }
    }, []);

    const getLoginError = (msg: string): { message: string; field: 'email' | 'password' | 'general' } => {
        if (msg.includes('Invalid login credentials')) {
            return { message: 'Email o contraseña incorrectos.', field: 'email' };
        }
        if (msg.includes('Email not confirmed')) {
            return { message: 'Por favor, confirma tu correo electrónico.', field: 'email' };
        }
        if (msg.includes('User not found')) {
            // No revelar si el usuario existe (anti-enumeración): mismo mensaje que credenciales inválidas.
            return { message: 'Email o contraseña incorrectos.', field: 'email' };
        }
        return { message: 'Error al iniciar sesión. Inténtalo de nuevo.', field: 'general' };
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError({ message: '', field: null });
        setIsLoading(true);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

            if (signInError) {
                setError(getLoginError(signInError.message));
                setIsLoading(false);
                return;
            }

            // Redirección condicionada por flujo de evaluación.
            // maybeSingle(): si la fila aún no existe no lanza error (evita mandar a
            // /evaluacion por un fallo de query a usuarios que ya completaron).
            const { data: { user } } = await supabase.auth.getUser();
            const { data: userData } = await supabase
                .from('users')
                .select('has_completed_evaluation, english_level')
                .eq('id', user?.id ?? '')
                .maybeSingle();

            const alreadyPlaced = Boolean(userData?.has_completed_evaluation || userData?.english_level);
            router.push(alreadyPlaced ? '/portal-alumno/dashboard' : '/portal-alumno/evaluacion');
            router.refresh();
        } catch (err: any) {
            setError({ message: err.message || 'Error al conectar con el servidor.', field: 'general' });
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError({ message: '', field: null });
        const { error: googleError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=/portal-alumno/evaluacion`,
            },
        });
        if (googleError) setError({ message: googleError.message, field: 'general' });
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Encabezado centrado estilo Wise */}
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-black text-[#1a1a1a] mb-2 tracking-tight">
                    Bienvenido de vuelta
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                    ¿Nuevo en Ludora?{' '}
                    <button
                        onClick={onSwitch}
                        className="text-[#1a1a1a] font-bold underline underline-offset-2 hover:text-[#88e04f] transition-colors"
                    >
                        Regístrate
                    </button>
                </p>
            </div>

            {/* MENSAJE GENERAL */}
            {error.field === 'general' && (
                <div className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                    <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 leading-relaxed font-medium">
                        {error.message}
                    </p>
                </div>
            )}

            {/* AVISO (éxito reset) */}
            {notice && (
                <div className="flex gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                    <Info className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700 leading-relaxed font-medium">{notice}</p>
                </div>
            )}

            <form className="space-y-4 w-full" onSubmit={handleSignIn}>
                {/* EMAIL */}
                <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-bold text-[#1a1a1a]">
                        Tu correo electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (error.field === 'email') setError({ message: '', field: null });
                        }}
                        placeholder="tu@correo.com"
                        className={`w-full bg-white border ${error.field === 'email' ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-[#1a1a1a]'} rounded-xl py-3.5 px-4 text-[#1a1a1a] transition-all outline-none`}
                        required
                    />
                    {error.field === 'email' && (
                        <p className="text-xs font-bold text-red-500 ml-1">
                            {error.message}
                        </p>
                    )}
                </div>

                {/* PASSWORD */}
                <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm font-bold text-[#1a1a1a]">
                        Tu contraseña
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error.field === 'password') setError({ message: '', field: null });
                            }}
                            placeholder="••••••••••••"
                            className={`w-full bg-white border ${error.field === 'password' ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-[#1a1a1a]'} rounded-xl py-3.5 pl-4 pr-12 text-[#1a1a1a] transition-all outline-none tracking-widest`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a1a1a] transition-colors"
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {error.field === 'password' && (
                        <p className="text-xs font-bold text-red-500 ml-1">
                            {error.message}
                        </p>
                    )}
                </div>

                {/* BOTÓN DE LOGIN */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#88e04f] hover:opacity-90 text-[#1a1a1a] font-black text-base rounded-full py-4 mt-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />
                            <span>Entrando...</span>
                        </>
                    ) : (
                        'Iniciar sesión'
                    )}
                </button>
            </form>

            {/* ¿PROBLEMAS PARA INICIAR SESIÓN? */}
            <div className="text-center -mt-2">
                <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm font-bold text-[#1a1a1a] underline underline-offset-2 hover:text-[#88e04f] transition-colors"
                >
                    ¿Problemas para iniciar sesión?
                </button>
            </div>

            {/* DIVISOR */}
            <div className="flex items-center gap-4 pt-2">
                <div className="h-[1px] bg-gray-200 flex-1" />
                <span className="text-xs text-gray-400 font-medium px-2">
                    O inicia sesión con
                </span>
                <div className="h-[1px] bg-gray-200 flex-1" />
            </div>

            {/* BOTÓN DE GOOGLE — única alternativa */}
            <div className="flex justify-center">
                <GoogleAuthButton onClick={handleGoogleSignIn} label="Continuar con Google" />
            </div>
        </div>
    );
}
