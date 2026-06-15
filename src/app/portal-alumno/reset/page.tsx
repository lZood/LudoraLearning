'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Eye, EyeOff, Info, CheckCircle2 } from 'lucide-react';

// Aterriza tras /auth/confirm?type=recovery (que ya estableció sesión vía verifyOtp).
// El usuario elige una nueva contraseña con supabase.auth.updateUser.
export default function ResetPasswordPage() {
    const router = useRouter();
    const supabase = createClient();

    const [checking, setChecking] = useState(true);
    const [hasSession, setHasSession] = useState(false);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setHasSession(!!user);
            setChecking(false);
        })();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
        if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
        setLoading(true);
        const { error: updErr } = await supabase.auth.updateUser({ password });
        if (updErr) { setError(updErr.message); setLoading(false); return; }
        setDone(true);
        setLoading(false);
        setTimeout(() => router.push('/portal-alumno/dashboard'), 1800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f1e4] px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-black text-[#1a1a1a] tracking-tight">Nueva contraseña</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Elige una contraseña segura para tu cuenta.</p>
                </div>

                {checking ? (
                    <p className="text-center text-gray-400 font-medium py-8">Verificando enlace…</p>
                ) : !hasSession ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                            <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 font-medium">
                                El enlace de recuperación no es válido o expiró. Solicita uno nuevo desde el inicio de sesión.
                            </p>
                        </div>
                        <button onClick={() => router.push('/portal-alumno')} className="w-full bg-[#88e04f] text-[#1a1a1a] font-black rounded-full py-3.5">
                            Volver al inicio de sesión
                        </button>
                    </div>
                ) : done ? (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                        <CheckCircle2 className="w-12 h-12 text-[#88e04f]" />
                        <p className="font-bold text-[#1a1a1a]">¡Contraseña actualizada!</p>
                        <p className="text-sm text-gray-500">Entrando a tu cuenta…</p>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                                <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-[#1a1a1a]">Nueva contraseña</label>
                            <div className="relative">
                                <input
                                    type={show ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full bg-white border border-gray-300 focus:border-[#1a1a1a] rounded-xl py-3.5 pl-4 pr-12 outline-none"
                                    required
                                />
                                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-[#1a1a1a]">Confirmar contraseña</label>
                            <input
                                type={show ? 'text' : 'password'}
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="Repite la contraseña"
                                className="w-full bg-white border border-gray-300 focus:border-[#1a1a1a] rounded-xl py-3.5 px-4 outline-none"
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-[#88e04f] hover:opacity-90 text-[#1a1a1a] font-black rounded-full py-4 mt-2 disabled:opacity-50">
                            {loading ? 'Guardando…' : 'Guardar contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
