import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Aterriza el botón "Confirmar mi correo" del email.
// Toma el token_hash que generamos vía admin.generateLink y lo canjea por
// una sesión válida usando verifyOtp (server-side). Si todo va bien,
// las cookies de sesión quedan seteadas y redirigimos a /portal-alumno/evaluacion.
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const token_hash = url.searchParams.get('token_hash');
    const type = url.searchParams.get('type') as EmailOtpType | null;
    const next = url.searchParams.get('next') ?? '/portal-alumno/evaluacion';

    if (!token_hash || !type) {
        return NextResponse.redirect(
            new URL('/portal-alumno?error=verify_missing_params', url.origin)
        );
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (error) {
        const code = error.message.toLowerCase().includes('expired')
            ? 'verify_expired'
            : 'verify_failed';
        return NextResponse.redirect(
            new URL(`/portal-alumno?error=${code}`, url.origin)
        );
    }

    return NextResponse.redirect(new URL(next, url.origin));
}
