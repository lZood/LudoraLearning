'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Plus, Loader2, AlertCircle } from 'lucide-react';

const LEVELS = [
    { value: 'Banda 1', label: 'Banda 1' },
    { value: 'Banda 2', label: 'Banda 2' },
    { value: 'Banda 3', label: 'Banda 3' },
];

export default function CreateGroupForm({ teacherId }: { teacherId: string }) {
    const supabase = createClient();
    const router = useRouter();

    const [name, setName] = useState('');
    const [level, setLevel] = useState(LEVELS[0].value);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setError('Escribe un nombre para el grupo.');
            return;
        }

        setLoading(true);
        setError(null);

        const { error: insertError } = await supabase
            .from('groups')
            .insert({ name: trimmed, teacher_id: teacherId, level });

        if (insertError) {
            setError('No se pudo crear el grupo. Intenta de nuevo.');
            setLoading(false);
            return;
        }

        setName('');
        setLevel(LEVELS[0].value);
        setLoading(false);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <label htmlFor="group-name" className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Nombre del grupo
                    </label>
                    <input
                        id="group-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Inglés 3°A"
                        disabled={loading}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#632EB0]/30 focus:border-[#632EB0] transition-all disabled:opacity-60"
                    />
                </div>
                <div className="sm:w-44">
                    <label htmlFor="group-level" className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Nivel
                    </label>
                    <select
                        id="group-level"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#632EB0]/30 focus:border-[#632EB0] transition-all disabled:opacity-60"
                    >
                        {LEVELS.map((l) => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#632EB0] text-white text-sm font-bold hover:bg-[#552699] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Creando...
                    </>
                ) : (
                    <>
                        <Plus className="w-4 h-4" /> Crear grupo
                    </>
                )}
            </button>
        </form>
    );
}
