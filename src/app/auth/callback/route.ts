import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

// Aterriza el flujo OAuth (Google) y cualquier flujo basado en ?code= (PKCE).
// Canjea el code por una sesión server-side (setea cookies) y redirige a `next`.
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const next = url.searchParams.get('next') ?? '/portal-alumno/evaluacion';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(new URL(next, url.origin));
        }
        console.error('[auth/callback] exchangeCodeForSession error:', error.message);
    }

    return NextResponse.redirect(new URL('/portal-alumno?error=oauth_failed', url.origin));
}
