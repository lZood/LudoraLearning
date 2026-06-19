'use client';
import { useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { tex } from '@/lib/voxel/textures';

type Props = { position: [number, number, number]; active?: boolean; onClick?: () => void };

export default function Fountain({ position, active = false, onClick }: Props) {
    const g = useRef<THREE.Group>(null);
    const t = useRef(0);
    useFrame((_, dt) => { if (!g.current) return; t.current += dt; g.current.position.y = position[1] + (active ? Math.abs(Math.sin(t.current * 3)) * 0.08 : 0); });
    return (
        <group ref={g} position={position}
            onClick={onClick ? (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); } : undefined}
            onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer'; } : undefined}
            onPointerOut={onClick ? () => { document.body.style.cursor = 'auto'; } : undefined}>
            {/* base de piedra */}
            <mesh position={[0, 0.22, 0]}><boxGeometry args={[0.92, 0.44, 0.92]} /><meshStandardMaterial map={tex('stonebrick')} /></mesh>
            {/* borde */}
            <mesh position={[0, 0.46, 0]}><boxGeometry args={[0.96, 0.1, 0.96]} /><meshStandardMaterial map={tex('stone')} /></mesh>
            {/* agua */}
            <mesh position={[0, 0.5, 0]}><boxGeometry args={[0.66, 0.06, 0.66]} /><meshStandardMaterial map={tex('water')} /></mesh>
            {/* pilar central */}
            <mesh position={[0, 0.62, 0]}><boxGeometry args={[0.18, 0.3, 0.18]} /><meshStandardMaterial map={tex('stone')} /></mesh>
        </group>
    );
}
