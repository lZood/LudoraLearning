// Biblia de tematización Minecraft — DESTREZAS → HERRAMIENTAS (capa de datos pura).
// Cada destreza (`activities.skill`) se representa como una herramienta del mundo y
// se ata a un rol de personaje (ver characters.ts). Sin cambios de DB. Ver §2.
//
// Mapeo (master plan): Listening=Brújula, Reading=Libro Encantado, Writing=Yunque,
// Speaking=Campana, Pronunciation=Afinador, Vocab/Conversation=Pico.
//
// `skill` se trata como string (no se acopla al tipo Skill) para admitir destrezas
// extra como 'vocab' sin romper compilación.

// Rol de personaje que "posee" la destreza (coincide con characters.ts).
export type CharacterRole = 'granjerita' | 'apicultor';

export interface SkillTool {
    tool: string;          // clave estable de la herramienta
    label: string;         // nombre visible (UI)
    characterRole: CharacterRole; // personaje guía de la destreza
}

const TOOLS: Record<string, SkillTool> = {
    listening: { tool: 'brujula', label: 'Brújula', characterRole: 'apicultor' },
    reading: { tool: 'libro', label: 'Libro Encantado', characterRole: 'granjerita' },
    writing: { tool: 'yunque', label: 'Yunque', characterRole: 'granjerita' },
    speaking: { tool: 'campana', label: 'Campana', characterRole: 'apicultor' },
    pronunciation: { tool: 'afinador', label: 'Afinador', characterRole: 'apicultor' },
    conversation: { tool: 'pico', label: 'Pico', characterRole: 'granjerita' },
    vocab: { tool: 'pico', label: 'Pico', characterRole: 'granjerita' },
};

// Respaldo seguro: el Pico (vocabulario) es la herramienta "todoterreno".
const FALLBACK: SkillTool = TOOLS.vocab;

// Devuelve la herramienta de una destreza. Tolerante a mayúsculas/undefined.
export function toolForSkill(skill?: string | null): SkillTool {
    if (!skill) return FALLBACK;
    return TOOLS[skill.toLowerCase()] || FALLBACK;
}
