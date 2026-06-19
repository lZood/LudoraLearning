'use client';
// Tablero estilo Duolingo: damero clicable (2 pasteles) + bandeja redondeada + setos redondeados en los muros.
// Deriva del grid de la aventura; click en casilla → onTile(x,y) (el motor BFS no cambia).
import { useMemo } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { worldTiles } from '@/lib/voxel/blocks';
import { toonGradient } from './toon';
import type { Adventure } from '@/lib/adventures';

function Hedge({ position }: { position: [number, number, number] }) {
    const grad = toonGradient();
    const tufts: [number, number, number][] = [[-0.22, 0, -0.18], [0.24, 0.04, 0.12], [0, 0.06, 0.26], [0.06, 0.02, -0.24]];
    return (
        <group position={position}>
            <RoundedBox args={[1, 0.9, 1]} radius={0.24} smoothness={3} position={[0, 0.39, 0]}>
                <meshToonMaterial color="#5fb04e" gradientMap={grad} />
            </RoundedBox>
            {tufts.map((t, i) => (
                <mesh key={i} position={[t[0], 0.86 + t[1], t[2]]} scale={[0.42, 0.3, 0.42]}>
                    <sphereGeometry args={[1, 12, 10]} />
                    <meshToonMaterial color="#79c463" gradientMap={grad} />
                </mesh>
            ))}
        </group>
    );
}

export function TileHighlight({ pos }: { pos: [number, number] | null }) {
    if (!pos) return null;
    return (
        <mesh position={[pos[0], 0.02, pos[1]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
            <planeGeometry args={[0.92, 0.92]} />
            <meshBasicMaterial color="#86e06a" transparent opacity={0.4} depthWrite={false} />
        </mesh>
    );
}

export default function DuolingoWorld({ A, onTile, onHover }: { A: Adventure; onTile: (x: number, y: number) => void; onHover: (x: number, y: number) => void }) {
    const tiles = useMemo(() => worldTiles(A), [A]);
    const cx = (A.cols - 1) / 2, cz = (A.rows - 1) / 2;
    const grad = toonGradient();
    const geo = useMemo(() => new THREE.BoxGeometry(0.96, 0.12, 0.96), []);
    const matLight = useMemo(() => new THREE.MeshToonMaterial({ color: new THREE.Color('#f3f8fb'), gradientMap: grad }), [grad]);
    const matDark = useMemo(() => new THREE.MeshToonMaterial({ color: new THREE.Color('#dcebf7'), gradientMap: grad }), [grad]);

    return (
        <group>
            {/* bandeja con grosor + esquinas redondeadas bajo el tablero */}
            <RoundedBox args={[A.cols + 0.5, 0.5, A.rows + 0.5]} radius={0.22} smoothness={3} position={[cx, -0.36, cz]}>
                <meshToonMaterial color="#dfeccf" gradientMap={grad} />
            </RoundedBox>
            {tiles.map(({ x, y, wall }) => wall ? (
                <Hedge key={`h${x}-${y}`} position={[x, 0, y]} />
            ) : (
                <mesh key={`${x}-${y}`} geometry={geo} material={(x + y) % 2 ? matLight : matDark} position={[x, -0.06, y]}
                    onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onTile(x, y); }}
                    onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(x, y); document.body.style.cursor = 'pointer'; }}
                    onPointerOut={() => { onHover(-1, -1); document.body.style.cursor = 'auto'; }} />
            ))}
        </group>
    );
}
