import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendConfirmationEmail } from '@/lib/emails/sendConfirmationEmail';
import { getSiteUrl } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';

interface ResendBody {
    email?: string;
    password?: string;
}

// Reenvía el correo de confirmación con un OTP/link nuevo.
// Requerimos password porque admin.generateLink({ type:'signup' }) la pide
// cuando el usuario todavía no está confirmado. La password vive solo en
// el state del cliente durante el flujo de registro — no se persiste.
export async function POST(request: NextRequest) {
    let body: ResendBody;
    try {
        body = (await request.json()) as ResendBody;
    } catch {
        return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
    }

    const { email, password } = body;
    if (!email || !password) {
        return NextResponse.json(
            { error: 'Faltan campos requeridos.' },
            { status: 400 }
        );
    }

    const supabaseAdmin = createAdminClient();
    // Rate-limit anti email-bombing (por IP y por correo).
    const ip = (request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown').trim();
    const [{ data: rlIp }, { data: rlEmail }] = await Promise.all([
        supabaseAdmin.rpc('check_rate_limit', { p_key: `resend:ip:${ip}`, p_max: 15, p_window: 600 }),
        supabaseAdmin.rpc('check_rate_limit', { p_key: `resend:email:${email.toLowerCase()}`, p_max: 4, p_window: 900 }),
    ]);
    if (rlIp === false || rlEmail === false) {
        return NextResponse.json({ error: 'Demasiados intentos. Espera unos minutos.' }, { status: 429 });
    }
    const origin = getSiteUrl();

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email,
        password,
        options: {
            redirectTo: `${origin}/auth/confirm?next=/portal-alumno/evaluacion`,
        },
    });

    if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already confirmed')) {
            return NextResponse.json(
                { error: 'Este correo ya fue confirmado. Inicia sesión.', field: 'email' },
                { status: 409 }
            );
        }
        console.error('[resend-confirmation] generateLink error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const props = data?.properties;
    if (!props?.email_otp || !props?.hashed_token) {
        return NextResponse.json(
            { error: 'No se pudo generar el correo de confirmación.' },
            { status: 500 }
        );
    }

    const confirmationUrl =
        `${origin}/auth/confirm` +
        `?token_hash=${encodeURIComponent(props.hashed_token)}` +
        `&type=signup` +
        `&next=${encodeURIComponent('/portal-alumno/evaluacion')}`;

    const { error: emailError } = await sendConfirmationEmail({
        to: email,
        token: props.email_otp,
        confirmationUrl,
    });

    if (emailError) {
        console.error('[resend-confirmation] Resend error:', emailError);
        return NextResponse.json(
            { error: 'No se pudo reenviar el correo.' },
            { status: 500 }
        );
    }

    return NextResponse.json({ ok: true });
}
