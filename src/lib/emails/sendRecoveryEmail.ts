import { render } from '@react-email/render';
import { createElement } from 'react';
import RecoveryEmail from '@/emails/RecoveryEmail';
import { resend, EMAIL_FROM } from '@/lib/resend';

interface SendRecoveryEmailParams {
    to: string;
    token: string;
    confirmationUrl: string;
}

export async function sendRecoveryEmail({ to, token, confirmationUrl }: SendRecoveryEmailParams) {
    const html = await render(
        createElement(RecoveryEmail, { token, confirmationUrl, email: to })
    );

    return resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject: 'Restablece tu contraseña · Ludora Learning',
        html,
    });
}
