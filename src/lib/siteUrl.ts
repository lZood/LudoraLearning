// URL pública del sitio. Fuente única y robusta: NO confía en el header `origin`
// (manipulable -> riesgo de host injection en los links de los correos).
// En dev se puede sobreescribir poniendo NEXT_PUBLIC_SITE_URL=http://localhost:3000 en .env.local
export function getSiteUrl(): string {
    const raw = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return raw.replace(/\/+$/, '');
}
