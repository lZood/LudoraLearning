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
    const [error, setError] = useState<{ message: string; field: 'name' | 'email' | 'phone' | 'password' | 'general' | null }>({ message: '', field: null });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError({ message: '', field: null });
        setIsLoading(true);

        if (phone.length !== 10) {
            setError({ message: 'El teléfono debe tener 10 dígitos.', field: 'phone' });
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
                    // Al hacer clic en el link del correo, el usuario aterriza aquí.
                    // /auth/callback intercambia el código por sesión y manda a la evaluación.
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/portal-alumno/evaluacion`,
                },
            });

            if (signUpError) {
                let msg = signUpError.message;
                let field: 'email' | 'password' | 'general' = 'general';
                
                if (msg.includes('User already registered')) {
                    msg = 'Este correo ya está registrado.';
                    field = 'email';
                } else if (msg.includes('Password should be at least 6 characters')) {
                    msg = 'La contraseña debe tener al menos 6 caracteres.';
                    field = 'password';
                }
                
                setError({ message: msg, field });
                setIsLoading(false);
                return;
            }

            // Registro OK: cambia al modo "verification" para que el usuario meta el código del correo.
            // La sesión todavía no existe hasta que confirme el OTP (verifyOtp).
            onSuccess(email);
        } catch (err: any) {
            setError({ message: err.message || 'Error al crear la cuenta', field: 'general' });
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
                    Crea tu cuenta
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                    ¿Ya tienes cuenta?{' '}
                    <button
                        onClick={onSwitch}
                        className="text-[#1a1a1a] font-bold underline underline-offset-2 hover:text-[#88e04f] transition-colors"
                    >
                        Inicia sesión
                    </button>
                </p>
            </div>

            {/* MENSAJE GENERAL */}
            {error.field === 'general' && (
                <div className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                    <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 leading-relaxed font-medium transition-all">
                        {error.message}
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
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error.field === 'name') setError({ message: '', field: null });
                        }}
                        placeholder="Juan Pérez"
                        className={`w-full bg-white border ${error.field === 'name' ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-[#88e04f]'} rounded-xl py-3.5 px-4 text-[#1a1a1a] transition-all outline-none`}
                        required
                    />
                    {error.field === 'name' && (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight ml-1">
                            {error.message}
                        </p>
                    )}
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
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (error.field === 'email') setError({ message: '', field: null });
                        }}
                        placeholder="ejemplo@correo.com"
                        className={`w-full bg-white border ${error.field === 'email' ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-[#88e04f]'} rounded-xl py-3.5 px-4 text-[#1a1a1a] transition-all outline-none`}
                        required
                    />
                    {error.field === 'email' && (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight ml-1">
                            {error.message}
                        </p>
                    )}
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
                            className={`bg-white border ${error.field === 'phone' ? 'border-red-500' : 'border-gray-200'} rounded-xl px-2 py-3 text-sm font-bold text-[#1a1a1a] focus:border-[#88e04f] transition-all outline-none`}
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
                            onChange={(e) => {
                                setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                                if (error.field === 'phone') setError({ message: '', field: null });
                            }}
                            placeholder="5512345678"
                            maxLength={10}
                            className={`flex-1 bg-white border ${error.field === 'phone' ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-[#88e04f]'} rounded-xl py-3.5 px-4 text-[#1a1a1a] transition-all outline-none`}
                            required
                        />
                    </div>
                    {error.field === 'phone' && (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight ml-1">
                            {error.message}
                        </p>
                    )}
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
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error.field === 'password') setError({ message: '', field: null });
                            }}
                            placeholder="Mínimo 6 caracteres"
                            className={`w-full bg-white border ${error.field === 'password' ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-[#88e04f]'} rounded-xl py-3.5 px-4 text-[#1a1a1a] transition-all outline-none tracking-widest`}
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
                    {error.field === 'password' && (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight ml-1">
                            {error.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#88e04f] hover:opacity-90 text-[#1a1a1a] font-black text-base rounded-full py-4 mt-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />
                            <span>Creando cuenta...</span>
                        </>
                    ) : 'Crear cuenta'}
                </button>
            </form>

            {/* DIVISOR */}
            <div className="flex items-center gap-4 pt-2">
                <div className="h-[1px] bg-gray-200 flex-1" />
                <span className="text-xs text-gray-400 font-medium px-2">
                    O regístrate con
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
