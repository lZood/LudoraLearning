// Mapeo del grid de la aventura → bloques del mundo voxel. El mundo se deriva del grid existente:
// cada casilla es una columna (pasto+tierra); '#' añade un seto encima (muro). Chars desconocidos
// = piso (backward-compatible). El opcional `theme` permite variar la paleta entre historias.
import type { Adventure } from '@/lib/adventures';

export const BLOCK = 1; // unidad de mundo por casilla

export const isWall = (A: Pick<Adventure, 'grid' | 'cols' | 'rows'>, x: number, y: number) =>
    x < 0 || y < 0 || x >= A.cols || y >= A.rows || A.grid[y]?.[x] === '#';

export type WorldTheme = 'overworld' | 'nether';

// Texturas por tema (para futuras historias, p. ej. "El Portal Roto" = nether).
export const THEME: Record<WorldTheme, { floorTop: string; floorSide: string; floorBottom: string; wall: string; sky: string }> = {
    overworld: { floorTop: 'grass_top', floorSide: 'grass_side', floorBottom: 'dirt', wall: 'hedge', sky: '#bfe9ff' },
    nether: { floorTop: 'stonebrick', floorSide: 'stone', floorBottom: 'stone', wall: 'stone', sky: '#5a2230' },
};

/** Lista de casillas {x,y,wall} a partir del grid. */
export function worldTiles(A: Pick<Adventure, 'grid' | 'cols' | 'rows'>) {
    const tiles: { x: number; y: number; wall: boolean }[] = [];
    for (let y = 0; y < A.rows; y++) for (let x = 0; x < A.cols; x++) tiles.push({ x, y, wall: A.grid[y]?.[x] === '#' });
    return tiles;
}
