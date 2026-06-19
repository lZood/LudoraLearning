// Identidad visual de personajes para el rig blocky: cara (PNG generado) + colores de cuerpo.
import type { AdvChar } from '@/lib/adventures';

export type SkinName = 'steve' | 'lily' | 'sam' | 'max';
export type CharSkin = { face: SkinName; skin: string; shirt: string; pants: string };

// Por rol de voz (AdvChar). El jugador usa PLAYER_SKIN.
export const CHAR_SKIN: Record<AdvChar, CharSkin> = {
    granjerita: { face: 'lily', skin: '#f4d0aa', shirt: '#7ec0ee', pants: '#8a5a3b' },
    apicultor: { face: 'sam', skin: '#f0c79f', shirt: '#f0e9d2', pants: '#caa46a' },
    narrator: { face: 'max', skin: '#f0c79f', shirt: '#cbb6a0', pants: '#5a5550' },
    npc1: { face: 'max', skin: '#f0c79f', shirt: '#9bd3e6', pants: '#6b5a48' },
    npc2: { face: 'max', skin: '#f0c79f', shirt: '#e69b9b', pants: '#45566b' },
    npc3: { face: 'sam', skin: '#f0c79f', shirt: '#bdd99b', pants: '#544536' },
};

export const PLAYER_SKIN: CharSkin = { face: 'steve', skin: '#f0c79f', shirt: '#3aa3c0', pants: '#3a5a8a' };
