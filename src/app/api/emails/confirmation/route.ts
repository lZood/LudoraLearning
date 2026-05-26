// TEST TEMPORAL: si esto responde "OK email route", el problema es React Email.
// Si sigue 404, el problema es que Next no detecta la ruta.
// Cuando confirmes que funciona, te paso la versión final con el render.

import { createElement } from 'react';
import { render } from '@react-email/render';
import ConfirmationEmail from '@/emails/ConfirmationEmail';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const url = new URL(request.url);

    // Modo debug: ?debug=1 devuelve texto plano para descartar problemas de React Email
    if (url.searchParams.get('debug') === '1') {
        return new Response('OK email route', {
            status: 200,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }

    try {
        const html = await render(createElement(ConfirmationEmail));
        return new Response(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store',
            },
        });
    } catch (err) {
        // Si React Email falla, ver el error real en pantalla en vez de un 500 mudo
        const message = err instanceof Error ? `${err.name}: ${err.message}\n\n${err.stack}` : String(err);
        return new Response(`render() failed:\n\n${message}`, {
            status: 500,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }
}
