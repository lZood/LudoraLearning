// Configuración compartida de los minijuegos "aprender jugando".
// Todos reusan el banco diagnostic_items (sanitizado) y otorgan XP/monedas vía /api/games/finish,
// con un TOPE DIARIO de XP por juegos para que no se pueda farmear el leaderboard.

export type GameId = 'crafteo' | 'aldea' | 'cueva';

export type GameDef = {
    id: GameId;
    title: string;
    tagline: string;
    types: string[];      // tipos de diagnostic_items que usa
    count: number;        // ítems por ronda
    xpPerCorrect: number; // XP por acierto (antes del tope)
    accent: string;       // color
};

export const GAMES: Record<GameId, GameDef> = {
    crafteo: {
        id: 'crafteo',
        title: 'Mesa de Crafteo',
        tagline: 'Craftea oraciones con bloques de palabras',
        types: ['word_bank'],
        count: 8,
        xpPerCorrect: 4,
        accent: '#8B5E3C',
    },
    aldea: {
        id: 'aldea',
        title: 'Defiende la Aldea',
        tagline: 'Derrota a los mobs respondiendo a tiempo',
        types: ['text_mc', 'audio_mc', 'listen_missing_word', 'minimal_pairs', 'fill_blank'],
        count: 12,
        xpPerCorrect: 3,
        accent: '#3FA34D',
    },
    cueva: {
        id: 'cueva',
        title: 'Expedición a la Cueva',
        tagline: 'Cava profundo y mina gemas con cada acierto',
        types: ['text_mc', 'audio_mc', 'listen_missing_word', 'minimal_pairs', 'fill_blank', 'multi_select'],
        count: 15,
        xpPerCorrect: 3,
        accent: '#632EB0',
    },
};

export const GAME_IDS = Object.keys(GAMES) as GameId[];
export const isGameId = (x: unknown): x is GameId => typeof x === 'string' && x in GAMES;

// Tope diario de XP ganable por minijuegos (anti-farmeo del leaderboard semanal).
export const GAME_XP_DAILY_CAP = 200;

// Banda (1-8) -> dificultad aproximada del ítem (espejo del seed: 1 + (band-1)*5/7).
export const parseBand = (englishLevel?: string | null): number => {
    const m = /(\d+)/.exec(englishLevel || '');
    return m ? Math.max(1, Math.min(8, parseInt(m[1], 10))) : 2;
};
export const bandToDifficulty = (band: number) => 1 + (Math.max(1, Math.min(8, band)) - 1) * (5 / 7);
