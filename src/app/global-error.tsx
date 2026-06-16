'use client';

import { useEffect } from 'react';

// Error boundary raíz: se activa si falla el propio layout raíz. Debe renderizar
// <html>/<body> porque reemplaza todo el documento. También recupera ChunkLoadError.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
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
        try { console.error('[ludora:global-error]', error); } catch { /* noop */ }
    }, [error]);

    return (
        <html lang="es">
            <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: '#fff', textAlign: 'center', padding: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#111', margin: 0 }}>Algo salió mal</h1>
                <p style={{ color: '#666', maxWidth: '420px', margin: 0 }}>Tuvimos un problema al cargar Ludora. Por favor recarga la página.</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => reset()} style={{ background: '#632EB0', color: '#fff', fontWeight: 800, padding: '12px 24px', borderRadius: '16px', border: 'none', cursor: 'pointer' }}>Reintentar</button>
                    <button
                        onClick={() => { try { sessionStorage.removeItem('ludora_chunk_reload'); } catch { /* noop */ } window.location.reload(); }}
                        style={{ background: '#f3f4f6', color: '#374151', fontWeight: 800, padding: '12px 24px', borderRadius: '16px', border: 'none', cursor: 'pointer' }}
                    >
                        Recargar
                    </button>
                </div>
            </body>
        </html>
    );
}
