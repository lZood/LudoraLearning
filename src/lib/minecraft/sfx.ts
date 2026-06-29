// Biblia de tematización Minecraft — EFECTOS DE SONIDO (capa de datos pura).
// Claves estables de sfx mapeadas a rutas reales en /public/audios/sounds-effect.
// Módulo data-puro (sin efectos): sólo describe qué archivo corresponde a cada clave;
// la reproducción la hace lessonAudio.ts. Ver §2 del master plan.
//
// NOTA SOBRE ASSETS DISPONIBLES: hoy en /public/audios/sounds-effect sólo existen
//   - Random_levelup.ogg
//   - Villager_accept1.ogg
//   - Villager_deny1.ogg
// Por eso varias claves apuntan al archivo existente MÁS PARECIDO (ver comentarios).
// Cuando se añadan clips propios de bloque, basta actualizar SFX_FILES sin tocar el
// resto del código (las claves son estables).

export type SfxKey = 'block_break' | 'block_place' | 'block_thud' | 'chest_open' | 'level_up';

const SFX_DIR = '/audios/sounds-effect';

// Clave -> nombre de archivo en SFX_DIR.
export const SFX_FILES: Record<SfxKey, string> = {
    // Acierto / romper bloque -> sonido afirmativo del aldeano (no hay clip de bloque aún).
    block_break: 'Villager_accept1.ogg',
    // Colocar bloque -> mismo afirmativo (placeholder hasta tener "place" propio).
    block_place: 'Villager_accept1.ogg',
    // Bloque que resiste (fallo) -> negativo del aldeano.
    block_thud: 'Villager_deny1.ogg',
    // Abrir cofre (recompensa) -> reutiliza el "level up" celebratorio por ahora.
    chest_open: 'Random_levelup.ogg',
    // Subir de nivel / encantamiento -> clip exacto disponible.
    level_up: 'Random_levelup.ogg',
};

// Volumen sugerido por clave (0–1). Decorativo, lo respeta el reproductor.
export const SFX_VOLUME: Record<SfxKey, number> = {
    block_break: 0.45,
    block_place: 0.45,
    block_thud: 0.5,
    chest_open: 0.7,
    level_up: 0.7,
};

// Devuelve la ruta pública del sfx (o null si la clave no existe).
export function sfxUrl(key: SfxKey): string | null {
    const file = SFX_FILES[key];
    return file ? `${SFX_DIR}/${file}` : null;
}
