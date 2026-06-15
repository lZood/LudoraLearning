import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendRecoveryEmail } from '@/lib/emails/sendRecoveryEmail';
import { getSiteUrl } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';

interface ResetBody { email?: string }

// Dispara el correo de recuperación con el patrón Resend (no depende del SMTP de GoTrue).
// Siempre responde { ok: true } para no filtrar si el correo existe (anti-enumeración).
export async function POST(request: NextRequest) {
    let body: ResetBody;
    try {
        body = (await request.json()) as ResetBody;
    } catch {
        return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
    }

    const { email } = body;
    if (!email) {
        return NextResponse.json({ error: 'Falta el correo.' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const origin = getSiteUrl();

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo: `${origin}/auth/confirm?next=/portal-alumno/reset` },
    });

    const props = data?.properties;
    if (!error && props?.email_otp && props?.hashed_token) {
        const confirmationUrl =
            `${origin}/auth/confirm` +
            `?token_hash=${encodeURIComponent(props.hashed_token)}` +
            `&type=recovery` +
            `&next=${encodeURIComponent('/portal-alumno/reset')}`;

        const { error: emailError } = await sendRecoveryEmail({
            to: email,
            token: props.email_otp,
            confirmationUrl,
        });
        if (emailError) console.error('[reset-request] Resend error:', emailError);
    } else if (error) {
        // Logueamos pero NO revelamos al cliente (anti-enumeración).
        console.error('[reset-request] generateLink error:', error.message);
    }

    return NextResponse.json({ ok: true });
}
