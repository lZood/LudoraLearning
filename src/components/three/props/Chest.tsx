'use client';
import { useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { tex } from '@/lib/voxel/textures';

type Props = { position: [number, number, number]; active?: boolean; open?: boolean; onClick?: () => void };

export default function Chest({ position, active = false, open = false, onClick }: Props) {
    const g = useRef<THREE.Group>(null);
    const lid = useRef<THREE.Group>(null);
    const t = useRef(0);
    useFrame((_, dt) => {
        if (g.current) { t.current += dt; g.current.position.y = position[1] + (active && !open ? Math.abs(Math.sin(t.current * 3)) * 0.08 : 0); }
        if (lid.current) { const tgt = open ? -1.15 : 0; lid.current.rotation.x += (tgt - lid.current.rotation.x) * Math.min(1, dt * 8); }
    });
    return (
        <group ref={g} position={position}
            onClick={onClick ? (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); } : undefined}
            onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer'; } : undefined}
            onPointerOut={onClick ? () => { document.body.style.cursor = 'auto'; } : undefined}>
            {/* cuerpo: cara frontal con candado (+Z), tapa = plank, resto = tablones+banda */}
            <mesh position={[0, 0.23, 0]}>
                <boxGeometry args={[0.72, 0.46, 0.5]} />
                <meshStandardMaterial attach="material-0" map={tex('chest_side')} />
                <meshStandardMaterial attach="material-1" map={tex('chest_side')} />
                <meshStandardMaterial attach="material-2" map={tex('plank')} />
                <meshStandardMaterial attach="material-3" map={tex('plank')} />
                <meshStandardMaterial attach="material-4" map={tex('chest_front')} />
                <meshStandardMaterial attach="material-5" map={tex('chest_side')} />
            </mesh>
            {/* tapa (bisagra atrás) */}
            <group ref={lid} position={[0, 0.46, -0.25]}>
                <mesh position={[0, 0.1, 0.25]}>
                    <boxGeometry args={[0.74, 0.2, 0.52]} />
                    <meshStandardMaterial attach="material-0" map={tex('chest_side')} />
                    <meshStandardMaterial attach="material-1" map={tex('chest_side')} />
                    <meshStandardMaterial attach="material-2" map={tex('plank')} />
                    <meshStandardMaterial attach="material-3" map={tex('plank')} />
                    <meshStandardMaterial attach="material-4" map={tex('chest_side')} />
                    <meshStandardMaterial attach="material-5" map={tex('chest_side')} />
                </mesh>
            </group>
            {/* destello de tesoro cuando está abierto */}
            {open && <mesh position={[0, 0.4, 0]}><boxGeometry args={[0.4, 0.18, 0.32]} /><meshStandardMaterial color="#ffe27a" emissive="#ffcf3a" emissiveIntensity={0.7} /></mesh>}
        </group>
    );
}
