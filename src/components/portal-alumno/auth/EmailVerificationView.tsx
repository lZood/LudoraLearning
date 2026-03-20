'use client';
import React, { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface EmailVerificationViewProps {
    email: string;
    onClose: () => void;
}

export default function EmailVerificationView({ email, onClose }: EmailVerificationViewProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(109); // 01:49 en segundos

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

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto focus next
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
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
                Ingresa el código enviado a <span className="text-[#1a1a1a] font-bold">{email}</span>
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
            <div className="flex gap-3 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm text-left mb-8">
                <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed italic">
                    Te recomendamos configurar una aplicación de autenticación para obtener el mayor nivel de seguridad. Puedes hacerlo en cualquier momento en Configuración &gt; Seguridad.
                </p>
            </div>

            {/* OTP Inputs */}
            <div className="flex justify-between w-full mb-10 gap-2">
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className="w-full aspect-square border-2 border-gray-200 rounded-xl text-center text-xl font-black text-[#1a1a1a] focus:border-[#0F5451] transition-all outline-none bg-white shadow-sm"
                    />
                ))}
            </div>

            {/* Resend Button */}
            <button
                disabled={timer > 0}
                className="w-full border border-gray-200 text-gray-400 font-black py-4 rounded-xl transition-all mb-6 disabled:bg-gray-50"
            >
                {timer > 0 ? `Reenviar código en (${formatTime(timer)})` : 'Reenviar código ahora'}
            </button>

            <div className="text-sm font-medium text-gray-500">
                ¿No puedes acceder a tu cuenta? <button className="text-[#0F5451] font-bold hover:underline">Contactar soporte</button>
            </div>
        </div>
    );
}
