'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Error boundary de Next.js (App Router) para cualquier página bajo el layout raíz.
// Evita el mensaje crudo "Application error: a client-side exception" y se
// auto-recupera de ChunkLoadError (chunks viejos en caché tras un deploy).
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        const text = `${error?.name || ''} ${error?.message || ''}`;
        const isChunk = /ChunkLoadError|Loading chunk|dynamically imported module|Importing a module script failed|Failed to fetch dynamically imported/i.test(text);
        if (isChunk && typeof window !== 'undefined') {
            const k = 'ludora_chunk_reload';
            const last = Number(sessionStorage.getItem(k) || '0');
            if (Date.now() - last > 20000) {
                sessionStorage.setItem(k, String(Date.now()));
                window.location.reload();
            }
        }
        try { console.error('[ludora:error]', error); } catch { /* noop */ }
    }, [error]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5 px-6 text-center">
            <img src="/svg_activity_cartoons/granjerita-triste.svg" alt="" className="w-28 h-28" />
            <h1 className="text-2xl font-black text-gray-900">Algo salió mal por un momento</h1>
            <p className="text-gray-500 font-medium max-w-sm">Tuvimos un problema al cargar esta parte. Reintenta o recarga la página.</p>
            <div className="flex gap-3">
                <button onClick={() => reset()} className="bg-[#632EB0] text-white font-black px-6 py-3 rounded-2xl active:scale-95">Reintentar</button>
                <button
                    onClick={() => { try { sessionStorage.removeItem('ludora_chunk_reload'); } catch { /* noop */ } window.location.reload(); }}
                    className="bg-gray-100 text-gray-700 font-black px-6 py-3 rounded-2xl active:scale-95"
                >
                    Recargar
                </button>
            </div>
            <Link href="/" className="text-sm font-bold text-gray-400 underline">Ir al inicio</Link>
        </div>
    );
}
