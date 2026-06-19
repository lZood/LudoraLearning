'use client';
// Selector de prop 3D por interactuable. Mapea por emoji/id/label → componente de cubos.
// Fallback genérico (caja) para interactuables nuevos en futuras historias.
import { useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { tex } from '@/lib/voxel/textures';
import type { Interactable } from '@/lib/adventures';
import Tree from './Tree';
import Fountain from './Fountain';
import Chest from './Chest';

export { Tree, Fountain, Chest };

type CrateProps = { position: [number, number, number]; active?: boolean; onClick?: () => void };
export function Crate({ position, active = false, onClick }: CrateProps) {
    const g = useRef<THREE.Group>(null);
    const t = useRef(0);
    useFrame((_, dt) => { if (!g.current) return; t.current += dt; g.current.position.y = position[1] + (active ? Math.abs(Math.sin(t.current * 3)) * 0.08 : 0); });
    return (
        <group ref={g} position={position}
            onClick={onClick ? (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); } : undefined}
            onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer'; } : undefined}
            onPointerOut={onClick ? () => { document.body.style.cursor = 'auto'; } : undefined}>
            <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.6, 0.6, 0.6]} /><meshStandardMaterial map={tex('plank')} /></mesh>
        </group>
    );
}

export function propFor(it: Interactable, o: { active: boolean; open: boolean; onClick: () => void }) {
    const tag = `${it.emoji || ''} ${it.id} ${it.label}`.toLowerCase();
    const common = { position: [it.x, 0, it.y] as [number, number, number], active: o.active, onClick: o.onClick };
    if (/🌳|🌲|tree|árbol|arbol/.test(tag)) return <Tree key={it.id} {...common} />;
    if (/⛲|fountain|fuente/.test(tag)) return <Fountain key={it.id} {...common} />;
    if (/🧰|📦|🎁|chest|cofre|baúl|baul/.test(tag)) return <Chest key={it.id} {...common} open={o.open} />;
    return <Crate key={it.id} {...common} />;
}
