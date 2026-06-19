'use client';
// Mundo voxel derivado del grid: cada casilla = bloque de piso; '#' añade un seto encima (muro).
// Interior plano → los lados de los bloques de piso quedan ocultos entre vecinos, así que un solo
// material (pasto) por bloque basta y es ligero en móvil. Click en el piso → mover (BFS del motor).
import { useMemo } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { tex } from '@/lib/voxel/textures';
import { worldTiles, THEME, type WorldTheme } from '@/lib/voxel/blocks';
import type { Adventure } from '@/lib/adventures';

export default function VoxelWorld({ A, theme = 'overworld', onTile }: { A: Adventure; theme?: WorldTheme; onTile: (x: number, y: number) => void }) {
    const th = THEME[theme];
    const tiles = useMemo(() => worldTiles(A), [A]);
    const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
    const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex(th.floorTop) }), [th.floorTop]);
    const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex(th.wall) }), [th.wall]);

    return (
        <group>
            {tiles.map(({ x, y, wall }) => (
                <group key={`${x}-${y}`}>
                    <mesh geometry={geo} material={floorMat} position={[x, -0.5, y]}
                        onClick={wall ? undefined : (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onTile(x, y); }}
                        onPointerOver={wall ? undefined : () => { document.body.style.cursor = 'pointer'; }}
                        onPointerOut={wall ? undefined : () => { document.body.style.cursor = 'auto'; }} />
                    {wall && <mesh geometry={geo} material={wallMat} position={[x, 0.5, y]} />}
                </group>
            ))}
        </group>
    );
}
