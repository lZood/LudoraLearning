'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Eye, EyeOff, Info } from 'lucide-react';
import GoogleAuthButton from './GoogleAuthButton';

interface RegisterFormProps {
    onSwitch: () => void;
    onSuccess: (email: string) => void;
}

export default function RegisterForm({ onSwitch, onSuccess }: RegisterFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+52');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (phone.length !== 10) {
            setError('El teléfono debe tener 10 dígitos.');
            setIsLoading(false);
            return;
        }

        try {
            const fullPhone = `${countryCode}${phone}`;
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        phone: fullPhone,
                    },
                    emailRedirectTo: `${window.location.origin}/portal-alumno/dashboard`,
                },
            });

            if (signUpError) {
                // Traducción de errores de registro
                let msg = signUpError.message;
                if (msg.includes('User already registered')) msg = 'Este correo ya está registrado.';
                if (msg.includes('Password should be at least 6 characters')) msg = 'La contraseña debe tener al menos 6 caracteres.';
                setError(msg);
                setIsLoading(false);
                return;
            }

            // Éxito en modo DEV: Redirigir directamente a la evaluación diagnóstica
            router.push('/portal-alumno/evaluacion');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al crear la cuenta');
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/portal-alumno/dashboard`,
            },
        });
        if (error) setError(error.message);
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* CUADRO DE ALERTA */}
            {error && (
                <div className="flex gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                        {error}
                    </p>
                </div>
            )}

            <form className="space-y-4 w-full" onSubmit={handleSignUp}>
                {/* NOMBRE */}
                <div className="space-y-1">
                    <label htmlFor="name" className="text-[10px] font-black text-[#1a1a1a] uppercase tracking-wider opacity-60">
                        Nombre completo
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Juan Pérez"
                        className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 text-[#1a1a1a] focus:border-[#0F5451] transition-all outline-none"
                        required
                    />
                </div>

                {/* EMAIL */}
                <div className="space-y-1">
                    <label htmlFor="reg-email" className="text-[10px] font-black text-[#1a1a1a] uppercase tracking-wider opacity-60">
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        id="reg-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 text-[#1a1a1a] focus:border-[#0F5451] transition-all outline-none"
                        required
                    />
                </div>

                {/* TELÉFONO */}
                <div className="space-y-1">
                    <label htmlFor="phone" className="text-[10px] font-black text-[#1a1a1a] uppercase tracking-wider opacity-60">
                        Teléfono móvil
                    </label>
                    <div className="flex gap-2">
                        <select 
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-2 py-3 text-sm font-bold text-[#1a1a1a] focus:border-[#0F5451] transition-all outline-none"
                        >
                            <option value="+52">🇲🇽 +52</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+57">🇨🇴 +57</option>
                            <option value="+34">🇪🇸 +34</option>
                            <option value="+54">🇦🇷 +54</option>
                        </select>
                        <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="5512345678"
                            maxLength={10}
                            className="flex-1 bg-white border border-gray-200 rounded-xl py-3.5 px-4 text-[#1a1a1a] focus:border-[#0F5451] transition-all outline-none"
                            required
                        />
                    </div>
                </div>

                {/* PASSWORD */}
                <div className="space-y-1">
                    <label htmlFor="reg-password" className="text-[10px] font-black text-[#1a1a1a] uppercase tracking-wider opacity-60">
                        Contraseña
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="reg-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 text-[#1a1a1a] focus:border-[#0F5451] transition-all outline-none tracking-widest"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1a1a1a] hover:bg-black text-white font-black text-lg rounded-xl py-4 mt-2 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                    {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
            </form>

            <p className="text-center text-gray-500 mt-2 font-medium">
                ¿Ya tienes una cuenta?{' '}
                <button 
                  onClick={onSwitch}
                  className="text-[#0F5451] font-black hover:underline transition-colors"
                >
                    Inicia sesión
                </button>
            </p>

            <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] bg-gray-200 flex-1" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-2">o</span>
                <div className="h-[1px] bg-gray-200 flex-1" />
            </div>

            <GoogleAuthButton onClick={handleGoogleSignIn} label="Regístrate con Google" />
        </div>
    );
}
