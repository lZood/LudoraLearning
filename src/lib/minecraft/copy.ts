// Biblia de tematización Minecraft — COPY DE APRENDIZAJE (capa de datos pura).
// Diccionario tipado: TODO string de aprendizaje (botones, feedback, verbos del mundo)
// pasa por aquí. Regla de oro: el feedback NUNCA es punitivo. Ver §2 ("Regla de oro").
//
// Identidad propia inspirada en Minecraft (sin nombres registrados de Mojang).

// Diccionario tipado. Las claves son estables; el valor es el texto visible.
export const COPY = {
    // ── Botones / navegación ──
    seeRecipe: 'Ver la receta',
    startCrafting: '¡A craftear!',
    startRecipe: 'Empezar receta',
    continue: 'Continuar',
    continueAdventure: 'Continuar tu aventura',
    check: 'Comprobar',
    skip: 'Saltar',
    backToVillage: 'Volver a la aldea',
    openChest: 'Abrir cofre',
    enterBiome: 'Entrar al bioma',
    lightTorch: 'Encender antorcha',

    // ── Feedback de acierto (no punitivo, celebratorio) ──
    correct: '¡Encaja!',
    blockPlaced: '¡Bloque colocado!',
    correctAlt: '¡Perfecto, encaja!',

    // ── Feedback de fallo (anima, no regaña) ──
    wrong: 'Ese bloque no encaja, prueba otro',
    wrongAlt: 'Casi. Ese bloque resiste, intenta con otro',
    keepGoing: 'Sigue picando, ya casi lo tienes',

    // ── Dominio / encantamiento ──
    enchantUp: '¡Encantamiento subió!',
    newMastery: 'Nueva maestría',

    // ── Repaso espaciado ──
    review: 'Repaso',
    reviewExpedition: 'Expedición de re-minado',
    worldChanged: 'El mundo cambió para ti',

    // ── Recompensa ──
    emeralds: 'esmeraldas',
    xp: 'XP',
    chestReward: '¡Cofre abierto!',

    // ── Gating / progreso ──
    locked: 'Estructura cerrada',
    lockedHint: 'Termina la estructura anterior para entrar',

    // ── Present (Libro de Recetas) ──
    recipeBookTitle: 'Libro de Recetas',
    tapEachBlock: 'Toca cada bloque',
} as const;

export type CopyKey = keyof typeof COPY;

// Verbos del mundo (para componer instrucciones dinámicas).
export const WORLD_VERBS = {
    mine: 'picar',
    place: 'colocar',
    craft: 'craftear',
    forge: 'forjar',
    enchant: 'encantar',
    repair: 'reparar',
    openChest: 'abrir el cofre',
} as const;

export type WorldVerbKey = keyof typeof WORLD_VERBS;

// Helper de acceso tipado. Devuelve el texto de la clave (o la propia clave si falta,
// para no romper la UI en caso de clave desconocida).
export function t(key: CopyKey): string {
    return COPY[key] ?? key;
}
