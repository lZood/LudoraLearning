import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendConfirmationEmail } from '@/lib/emails/sendConfirmationEmail';

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
    const origin =
        request.headers.get('origin') ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        new URL(request.url).origin;

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
        return NextResponse.json({ error: error.message }, { status: 400 });
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
