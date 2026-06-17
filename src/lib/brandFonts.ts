// Fuentes de marca para el portal (misma esencia que la landing/hero).
//  - Neue Machina Ultrabold: titulares display (mayúsculas, tracking), el "CRAFT YOUR ENGLISH".
//  - Montserrat: cuerpo/subtítulos con carácter.
import localFont from 'next/font/local';
import { Montserrat } from 'next/font/google';

export const neueMachina = localFont({
    src: '../../public/fonts/NeueMachina-Ultrabold.otf',
    display: 'swap',
    variable: '--font-display',
});

export const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
    variable: '--font-body',
});
