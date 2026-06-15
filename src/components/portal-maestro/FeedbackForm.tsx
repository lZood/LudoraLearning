'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Send, Loader2, AlertCircle } from 'lucide-react';

type Audience = 'student' | 'teacher' | 'both';

const AUDIENCE_OPTIONS: { value: Audience; label: string }[] = [
    { value: 'student', label: 'Alumno' },
    { value: 'teacher', label: 'Maestro' },
    { value: 'both', label: 'Ambos' },
];

// Formulario para que el maestro deje retroalimentación a un alumno.
// Inserta en feedback_sessions vía el cliente browser (RLS permite author_id = uid).
export default function FeedbackForm({
    studentId,
    authorId,
}: {
    studentId: string;
    authorId: string;
}) {
    const supabase = createClient();
    const router = useRouter();

    const [content, setContent] = useState('');
    const [audience, setAudience] = useState<Audience>('student');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = content.trim();
        if (!trimmed) {
            setError('Escribe un mensaje antes de enviar.');
            return;
        }

        setLoading(true);
        setError(null);

        const { error: insertError } = await supabase.from('feedback_sessions').insert({
            student_id: studentId,
            author_id: authorId,
            author_type: 'teacher',
            audience,
            content: trimmed,
        });

        setLoading(false);

        if (insertError) {
            setError('No se pudo enviar la retroalimentación. Intenta de nuevo.');
            return;
        }

        setContent('');
        setAudience('student');
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="feedback-content" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    Mensaje
                </label>
                <textarea
                    id="feedback-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={loading}
                    rows={4}
                    placeholder="Escribe tu retroalimentación para el alumno..."
                    className="w-full rounded-2xl border border-gray-200 bg-[#f7f7fb] px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#632EB0] focus:ring-2 focus:ring-[#632EB0]/20 disabled:opacity-60"
                />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="sm:max-w-xs">
                    <label htmlFor="feedback-audience" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                        Audiencia
                    </label>
                    <select
                        id="feedback-audience"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value as Audience)}
                        disabled={loading}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-all focus:border-[#632EB0] focus:ring-2 focus:ring-[#632EB0]/20 disabled:opacity-60"
                    >
                        {AUDIENCE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#632EB0] px-6 py-3 text-sm font-black text-white shadow-sm transition-all hover:bg-[#542598] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4" />
                            Enviar
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}
        </form>
    );
}
