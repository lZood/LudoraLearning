import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getSiteUrl } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';

// Aterriza el flujo OAuth (Google) y cualquier flujo basado en ?code= (PKCE).
// Canjea el code por una sesión server-side (setea cookies) y redirige a `next`.
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const next = url.searchParams.get('next') ?? '/portal-alumno/evaluacion';
    // URL canónica del sitio: detrás de Traefik, request.url llega como host interno
    // (localhost:3000), así que NO usamos url.origin para construir el redirect.
    const base = getSiteUrl();

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(new URL(next, base));
        }
        console.error('[auth/callback] exchangeCodeForSession error:', error.message);
    }

    return NextResponse.redirect(new URL('/portal-alumno?error=oauth_failed', base));
}
