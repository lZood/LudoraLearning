import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey && process.env.NODE_ENV === 'production') {
    // En desarrollo dejamos pasar para no romper el build; en runtime fallará al enviar.
    console.warn('[resend] RESEND_API_KEY no está configurado.');
}

// `||` (no `??`): cubre también string vacío, para que un RESEND_API_KEY="" no
// rompa el build/instanciación. En runtime el envío fallará si no hay key real.
export const resend = new Resend(apiKey || 'placeholder');

// Remitente por defecto. Cambia EMAIL_FROM en tu .env si usas otro dominio.
export const EMAIL_FROM =
    process.env.EMAIL_FROM ?? 'Ludora Learning <noreply@ludoralearning.com>';
