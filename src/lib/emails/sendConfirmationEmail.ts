import { render } from '@react-email/render';
import { createElement } from 'react';
import ConfirmationEmail from '@/emails/ConfirmationEmail';
import { resend, EMAIL_FROM } from '@/lib/resend';

interface SendConfirmationEmailParams {
    to: string;
    token: string;
    confirmationUrl: string;
}

export async function sendConfirmationEmail({
    to,
    token,
    confirmationUrl,
}: SendConfirmationEmailParams) {
    const html = await render(
        createElement(ConfirmationEmail, {
            token,
            confirmationUrl,
            email: to,
        })
    );

    return resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject: 'Confirma tu correo en Ludora Learning',
        html,
    });
}
