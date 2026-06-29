// Biblia de tematización Minecraft — PERSONAJES (capa de datos pura).
// Centraliza la lógica que hoy vive suelta en el player
// (page.tsx:20-21, `charForSkill`) para que TODOS los pilares usen la misma fuente.
// Sin cambios de DB. Ver §2.1 del master plan.
//
// Reparto (identidad propia, inspirado en Minecraft, sin nombres de Mojang):
//  - Lía (granjerita): guía Reading / Writing / Conversation / Vocab.
//  - Sam (apicultor): guía Listening / Speaking / Pronunciation.
//  - Sabio (narrator): voz del mundo / instrucciones.
//  - Aldeano: NPC de diálogo (charlas, mercado).

// Clave de personaje visual (coincide con el componente Mascot y VOICE_ROLES).
export type CharacterKey = 'granjerita' | 'apicultor';
// Rol narrativo ampliado (incluye personajes sin sprite de mascota).
export type CharacterRole = 'granjerita' | 'apicultor' | 'narrator' | 'aldeano';

export interface Character {
    key: CharacterRole;      // rol/clave estable
    name: string;            // nombre propio visible (UI)
    voiceRole: string;       // rol de voz para lessonAudio (VOICE_ROLES)
    mascot?: CharacterKey;   // sprite de Mascot.tsx, si lo tiene
    role: string;            // descripción corta del personaje
}

// Nombres propios centralizados (única fuente de verdad de copy de personajes).
export const CHARACTER_NAMES = {
    granjerita: 'Lía',
    apicultor: 'Sam',
    narrator: 'Sabio',
    aldeano: 'Aldeano',
} as const;

export const CHARACTERS: Record<CharacterRole, Character> = {
    granjerita: { key: 'granjerita', name: CHARACTER_NAMES.granjerita, voiceRole: 'granjerita', mascot: 'granjerita', role: 'Granjerita guía' },
    apicultor: { key: 'apicultor', name: CHARACTER_NAMES.apicultor, voiceRole: 'apicultor', mascot: 'apicultor', role: 'Apicultor guía' },
    narrator: { key: 'narrator', name: CHARACTER_NAMES.narrator, voiceRole: 'narrator', role: 'Voz del mundo / instrucciones' },
    aldeano: { key: 'aldeano', name: CHARACTER_NAMES.aldeano, voiceRole: 'narrator', role: 'NPC de diálogo' },
};

// Destreza -> personaje guía (mascota). Sam lleva las destrezas de oído/voz;
// Lía las de lectura/escritura/conversación. Equivale a `charForSkill` del player,
// pero ahora centralizado. Devuelve la clave de Mascot ('granjerita' | 'apicultor').
export function charForSkill(skill?: string | null): CharacterKey {
    const s = (skill || '').toLowerCase();
    return s === 'listening' || s === 'speaking' || s === 'pronunciation' ? 'apicultor' : 'granjerita';
}

// Igual que charForSkill pero devuelve el objeto Character completo (nombre, voz…).
export function characterForSkill(skill?: string | null): Character {
    return CHARACTERS[charForSkill(skill)];
}
