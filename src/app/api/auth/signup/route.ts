import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendConfirmationEmail } from '@/lib/emails/sendConfirmationEmail';
import { getSiteUrl } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';

interface SignupBody {
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
}

export async function POST(request: NextRequest) {
    let body: SignupBody;
    try {
        body = (await request.json()) as SignupBody;
    } catch {
        return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
    }

    const { email, password, fullName, phone } = body;

    if (!email || !password || !fullName) {
        return NextResponse.json(
            { error: 'Faltan campos requeridos.' },
            { status: 400 }
        );
    }
    if (password.length < 6) {
        return NextResponse.json(
            { error: 'La contraseña debe tener al menos 6 caracteres.', field: 'password' },
            { status: 400 }
        );
    }

    const supabaseAdmin = createAdminClient();
    // Rate-limit anti-spam/email-bombing: por IP y por correo (el de correo no es falsificable).
    const ip = (request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown').trim();
    const [{ data: rlIp }, { data: rlEmail }] = await Promise.all([
        supabaseAdmin.rpc('check_rate_limit', { p_key: `signup:ip:${ip}`, p_max: 15, p_window: 600 }),
        supabaseAdmin.rpc('check_rate_limit', { p_key: `signup:email:${email.toLowerCase()}`, p_max: 4, p_window: 3600 }),
    ]);
    if (rlIp === false || rlEmail === false) {
        return NextResponse.json({ error: 'Demasiados intentos. Espera unos minutos.' }, { status: 429 });
    }
    // No confiamos en el header `origin` (manipulable): usamos la URL canónica del sitio.
    const origin = getSiteUrl();

    // generateLink({ type: 'signup' }) crea al usuario en estado no-confirmado
    // y devuelve email_otp + hashed_token para que enviemos NOSOTROS el correo.
    // Si el usuario ya existe y NO está confirmado, simplemente regenera el OTP.
    // Si ya está confirmado, devuelve error.
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email,
        password,
        options: {
            data: { full_name: fullName, phone },
            redirectTo: `${origin}/auth/confirm?next=/portal-alumno/evaluacion`,
        },
    });

    if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already exists')) {
            return NextResponse.json(
                { error: 'Este correo ya está registrado.', field: 'email' },
                { status: 409 }
            );
        }
        console.error('[signup] generateLink error:', error);
        return NextResponse.json({ error: 'No se pudo completar el registro.' }, { status: 400 });
    }

    const props = data?.properties;
    if (!props?.email_otp || !props?.hashed_token) {
        console.error('[signup] generateLink no devolvió OTP/hashed_token', data);
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
        console.error('[signup] Resend error:', emailError);
        return NextResponse.json(
            { error: 'No se pudo enviar el correo de confirmación.' },
            { status: 500 }
        );
    }

    return NextResponse.json({ ok: true });
}
