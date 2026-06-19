'use client';
import { useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { tex } from '@/lib/voxel/textures';

type Props = { position: [number, number, number]; active?: boolean; onClick?: () => void };

export default function Tree({ position, active = false, onClick }: Props) {
    const g = useRef<THREE.Group>(null);
    const t = useRef(0);
    useFrame((_, dt) => { if (!g.current) return; t.current += dt; g.current.position.y = position[1] + (active ? Math.abs(Math.sin(t.current * 3)) * 0.08 : 0); });
    return (
        <group ref={g} position={position}
            onClick={onClick ? (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); } : undefined}
            onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer'; } : undefined}
            onPointerOut={onClick ? () => { document.body.style.cursor = 'auto'; } : undefined}>
            {/* tronco */}
            <mesh position={[0, 0.55, 0]}><boxGeometry args={[0.3, 1.1, 0.3]} /><meshStandardMaterial map={tex('log_side')} /></mesh>
            {/* copa (hojas) */}
            <mesh position={[0, 1.45, 0]}><boxGeometry args={[1.15, 0.8, 1.15]} /><meshStandardMaterial map={tex('leaves')} /></mesh>
            <mesh position={[0, 1.95, 0]}><boxGeometry args={[0.75, 0.55, 0.75]} /><meshStandardMaterial map={tex('leaves')} /></mesh>
        </group>
    );
}
