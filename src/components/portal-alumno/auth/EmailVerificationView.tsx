'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Info, X, Loader2 } from 'lucide-react';

interface EmailVerificationViewProps {
    email: string;
    password: string;
    onClose: () => void;
}

const RESEND_COOLDOWN_SECONDS = 60;

export default function EmailVerificationView({ email, password, onClose }: EmailVerificationViewProps) {
    const router = useRouter();
    const supabase = createClient();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(RESEND_COOLDOWN_SECONDS);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string>('');
    const [info, setInfo] = useState<string>('');
    const verifiedRef = useRef(false);

    // Cuenta regresiva del cooldown de reenvío
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Verifica el OTP contra Supabase Auth
    const verifyOtp = async (code: string) => {
        if (verifiedRef.current) return;
        verifiedRef.current = true;
        setIsVerifying(true);
        setError('');

        const { error: verifyError } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'signup',
        });

        if (verifyError) {
            verifiedRef.current = false;
            setIsVerifying(false);
            // Mensajes amigables
            const msg = verifyError.message.toLowerCase();
            if (msg.includes('expired')) {
                setError('El código expiró. Solicita uno nuevo.');
            } else if (msg.includes('invalid')) {
                setError('Código incorrecto. Revísalo e inténtalo de nuevo.');
            } else {
                setError(verifyError.message);
            }
            // Limpia inputs y enfoca el primero para reintentar
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
            return;
        }

        // OK: Supabase ya creó la sesión. Vamos a la evaluación diagnóstica.
        router.push('/portal-alumno/evaluacion');
        router.refresh();
    };

    // Auto-submit cuando los 6 dígitos estén llenos
    useEffect(() => {
        const code = otp.join('');
        if (code.length === 6 && /^\d{6}$/.test(code) && !isVerifying && !verifiedRef.current) {
            verifyOtp(code);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otp]);

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    // Soporta pegar el código completo de 6 dígitos en cualquier input
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 0) return;
        e.preventDefault();
        const newOtp = ['', '', '', '', '', ''];
        for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
        setOtp(newOtp);
        setError('');
        document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
    };

    const handleResend = async () => {
        if (timer > 0 || isResending) return;
        setIsResending(true);
        setError('');
        setInfo('');

        try {
            const res = await fetch('/api/auth/resend-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const payload = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(payload?.error || 'No se pudo reenviar el correo.');
                return;
            }

            setInfo('Te enviamos un nuevo código.');
            setTimer(RESEND_COOLDOWN_SECONDS);
        } catch (err: any) {
            setError(err?.message || 'No se pudo reenviar el correo.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex flex-col items-center text-center w-full max-w-sm mx-auto">
            {/* Header (Solo para Modal UI móvil) */}
            <div className="w-full flex justify-end mb-4 lg:hidden">
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-500" />
                </button>
            </div>

            <h2 className="text-2xl font-black text-[#1a1a1a] mb-2 uppercase tracking-tight">Verificación requerida</h2>
            <p className="text-sm text-gray-500 font-medium mb-8">
                Ingresa el código de 6 dígitos enviado a <span className="text-[#1a1a1a] font-bold">{email}</span>
            </p>

            {/* Illustration */}
            <div className="mb-8 w-40 h-40 bg-blue-50 rounded-full flex items-center justify-center relative">
               <div className="absolute -bottom-2 -right-2">
                   <div className="bg-white p-3 rounded-2xl shadow-xl transform rotate-12 border border-blue-100">
                        <span className="text-[#632eaf] font-black text-xs">123 456</span>
                   </div>
               </div>
               <svg className="w-20 h-20 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
               </svg>
            </div>

            {/* Info Box */}
            <div className="flex gap-3 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm text-left mb-6">
                <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed italic">
                    Revisa también tu carpeta de spam. El código expira en unos minutos; si no llega, usa "Reenviar código".
                </p>
            </div>

            {/* Feedback messages */}
            {error && (
                <div className="w-full mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-xs font-bold text-red-600">{error}</p>
                </div>
            )}
            {info && !error && (
                <div className="w-full mb-4 p-3 bg-green-50 border border-green-100 rounded-xl">
                    <p className="text-xs font-bold text-green-700">{info}</p>
                </div>
            )}

            {/* OTP Inputs */}
            <div className="flex justify-between w-full mb-6 gap-2">
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        disabled={isVerifying}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        className={`w-full aspect-square border-2 rounded-xl text-center text-xl font-black text-[#1a1a1a] focus:border-[#0F5451] transition-all outline-none bg-white shadow-sm ${error ? 'border-red-300' : 'border-gray-200'} disabled:opacity-60`}
                    />
                ))}
            </div>

            {/* Estado de verificación */}
            {isVerifying && (
                <div className="flex items-center gap-2 text-sm font-bold text-[#0F5451] mb-6">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando…</span>
                </div>
            )}

            {/* Resend Button */}
            <button
                onClick={handleResend}
                disabled={timer > 0 || isResending || isVerifying}
                className="w-full border border-gray-200 text-gray-600 font-black py-4 rounded-xl transition-all mb-6 disabled:bg-gray-50 disabled:text-gray-400 hover:bg-gray-50"
            >
                {isResending
                    ? 'Reenviando…'
                    : timer > 0
                        ? `Reenviar código en (${formatTime(timer)})`
                        : 'Reenviar código ahora'}
            </button>

            <div className="text-sm font-medium text-gray-500">
                ¿No puedes acceder a tu cuenta? <button className="text-[#0F5451] font-bold hover:underline">Contactar soporte</button>
            </div>
        </div>
    );
}
