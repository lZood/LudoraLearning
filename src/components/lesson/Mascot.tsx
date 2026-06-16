'use client';

export type MascotMood = 'curious' | 'happy' | 'sad';
export type MascotCharacter = 'granjerita' | 'apicultor';

const SRC: Record<MascotCharacter, Record<MascotMood, string>> = {
    granjerita: {
        curious: '/svg_activity_cartoons/granjerita-curiosa.svg',
        happy: '/svg_activity_cartoons/granjerita-feliz.svg',
        sad: '/svg_activity_cartoons/granjerita-triste.svg',
    },
    apicultor: {
        curious: '/svg_activity_cartoons/apicultor-curioso.svg',
        happy: '/svg_activity_cartoons/apicultor-feliz.svg',
        sad: '/svg_activity_cartoons/apicultor-triste.svg',
    },
};

export default function Mascot({ mood = 'curious', character = 'granjerita', className = '' }: { mood?: MascotMood; character?: MascotCharacter; className?: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={SRC[character][mood]} alt="" className={`select-none pointer-events-none ${className}`} draggable={false} />;
}
