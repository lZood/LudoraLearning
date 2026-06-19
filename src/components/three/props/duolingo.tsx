'use client';
// Props redondeados estilo Duolingo (toon pastel), de alturas variadas, sobre un parche de pasto + sombra blob.
// Marcador flotante (Float) cuando el prop es el objetivo activo, para indicar "toca aquí".
import { useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { RoundedBox, Float } from '@react-three/drei';
import * as THREE from 'three';
import { toonGradient, BlobShadow } from '../toon';
import type { Interactable } from '@/lib/adventures';

type PropProps = { position: [number, number, number]; active?: boolean; open?: boolean; onClick?: () => void };

const grad = () => toonGradient();
const clickHandler = (onClick?: () => void) => onClick ? (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); } : undefined;
const hoverIn = () => { document.body.style.cursor = 'pointer'; };
const hoverOut = () => { document.body.style.cursor = 'auto'; };

function GrassPatch() {
    return <mesh position={[0, 0.015, 0]}><cylinderGeometry args={[0.46, 0.46, 0.07, 22]} /><meshToonMaterial color="#8fd07a" gradientMap={grad()} /></mesh>;
}

function TargetMarker() {
    return (
        <Float speed={5} floatIntensity={0.9} rotationIntensity={0}>
            <mesh position={[0, 1.55, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.14, 0.28, 4]} />
                <meshToonMaterial color="#ffd23f" emissive="#ffb703" emissiveIntensity={0.35} gradientMap={grad()} />
            </mesh>
        </Float>
    );
}

export function DuolingoTree({ position, active = false, onClick }: PropProps) {
    const g = useRef<THREE.Group>(null);
    const t = useRef(0);
    useFrame((_, dt) => { if (!g.current) return; t.current += dt; g.current.rotation.z = (active ? 0.04 : 0.015) * Math.sin(t.current * (active ? 2.2 : 0.8)); });
    return (
        <group position={position} onClick={clickHandler(onClick)} onPointerOver={onClick ? hoverIn : undefined} onPointerOut={onClick ? hoverOut : undefined}>
            <GrassPatch />
            <BlobShadow radius={0.6} opacity={0.22} />
            <group ref={g}>
                <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.12, 0.16, 1, 12]} /><meshToonMaterial color="#b07a4f" gradientMap={grad()} /></mesh>
                <mesh position={[0, 1.35, 0]} scale={[1, 0.92, 1]}><sphereGeometry args={[0.62, 18, 16]} /><meshToonMaterial color="#5fb257" gradientMap={grad()} /></mesh>
                <mesh position={[-0.3, 1.1, 0.08]} scale={[1, 0.92, 1]}><sphereGeometry args={[0.4, 16, 14]} /><meshToonMaterial color="#6fc065" gradientMap={grad()} /></mesh>
                <mesh position={[0.32, 1.16, -0.06]} scale={[1, 0.92, 1]}><sphereGeometry args={[0.42, 16, 14]} /><meshToonMaterial color="#6fc065" gradientMap={grad()} /></mesh>
                <mesh position={[0, 1.78, 0]} scale={[1, 0.92, 1]}><sphereGeometry args={[0.4, 16, 14]} /><meshToonMaterial color="#7ccb66" gradientMap={grad()} /></mesh>
            </group>
            {active && <TargetMarker />}
        </group>
    );
}

export function DuolingoFountain({ position, active = false, onClick }: PropProps) {
    return (
        <group position={position} onClick={clickHandler(onClick)} onPointerOver={onClick ? hoverIn : undefined} onPointerOut={onClick ? hoverOut : undefined}>
            <GrassPatch />
            <BlobShadow radius={0.55} opacity={0.24} />
            <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[0.5, 0.55, 0.36, 22]} /><meshToonMaterial color="#cdd2d8" gradientMap={grad()} /></mesh>
            <mesh position={[0, 0.37, 0]}><cylinderGeometry args={[0.42, 0.42, 0.06, 22]} /><meshToonMaterial color="#9fd6e8" gradientMap={grad()} /></mesh>
            <mesh position={[0, 0.52, 0]}><cylinderGeometry args={[0.08, 0.1, 0.32, 12]} /><meshToonMaterial color="#cdd2d8" gradientMap={grad()} /></mesh>
            <mesh position={[0, 0.7, 0]}><sphereGeometry args={[0.12, 14, 12]} /><meshToonMaterial color="#9fd6e8" gradientMap={grad()} /></mesh>
            {active && <TargetMarker />}
        </group>
    );
}

export function DuolingoChest({ position, active = false, open = false, onClick }: PropProps) {
    const g = useRef<THREE.Group>(null);
    const lid = useRef<THREE.Group>(null);
    const t = useRef(0);
    useFrame((_, dt) => {
        if (g.current) { t.current += dt; g.current.position.y = position[1] + (active && !open ? Math.abs(Math.sin(t.current * 3)) * 0.06 : 0); }
        if (lid.current) { const tgt = open ? -1.1 : 0; lid.current.rotation.x += (tgt - lid.current.rotation.x) * Math.min(1, dt * 8); }
    });
    return (
        <group ref={g} position={position} onClick={clickHandler(onClick)} onPointerOver={onClick ? hoverIn : undefined} onPointerOut={onClick ? hoverOut : undefined}>
            <GrassPatch />
            <BlobShadow radius={0.48} opacity={0.26} />
            <RoundedBox args={[0.7, 0.42, 0.5]} radius={0.08} smoothness={3} position={[0, 0.27, 0]}><meshToonMaterial color="#c9914f" gradientMap={grad()} /></RoundedBox>
            <group ref={lid} position={[0, 0.46, -0.25]}>
                <RoundedBox args={[0.72, 0.2, 0.52]} radius={0.08} smoothness={3} position={[0, 0.06, 0.25]}><meshToonMaterial color="#dba85f" gradientMap={grad()} /></RoundedBox>
            </group>
            <mesh position={[0, 0.28, 0.26]}><boxGeometry args={[0.1, 0.14, 0.04]} /><meshToonMaterial color="#ffd23f" gradientMap={grad()} /></mesh>
            {open && <mesh position={[0, 0.42, 0]}><sphereGeometry args={[0.16, 12, 10]} /><meshToonMaterial color="#ffe27a" emissive="#ffcf3a" emissiveIntensity={0.6} gradientMap={grad()} /></mesh>}
            {active && !open && <TargetMarker />}
        </group>
    );
}

export function DuolingoBench({ position, onClick }: PropProps) {
    return (
        <group position={position} onClick={clickHandler(onClick)} onPointerOver={onClick ? hoverIn : undefined} onPointerOut={onClick ? hoverOut : undefined}>
            <BlobShadow radius={0.5} opacity={0.2} />
            <mesh position={[0, 0.24, 0]}><boxGeometry args={[0.8, 0.08, 0.34]} /><meshToonMaterial color="#c2904f" gradientMap={grad()} /></mesh>
            <mesh position={[0, 0.42, -0.14]}><boxGeometry args={[0.8, 0.28, 0.06]} /><meshToonMaterial color="#c2904f" gradientMap={grad()} /></mesh>
            <mesh position={[-0.32, 0.12, 0]}><boxGeometry args={[0.08, 0.24, 0.3]} /><meshToonMaterial color="#9c7038" gradientMap={grad()} /></mesh>
            <mesh position={[0.32, 0.12, 0]}><boxGeometry args={[0.08, 0.24, 0.3]} /><meshToonMaterial color="#9c7038" gradientMap={grad()} /></mesh>
        </group>
    );
}

export function DuolingoCrate({ position, active = false, onClick }: PropProps) {
    return (
        <group position={position} onClick={clickHandler(onClick)} onPointerOver={onClick ? hoverIn : undefined} onPointerOut={onClick ? hoverOut : undefined}>
            <GrassPatch />
            <BlobShadow radius={0.42} opacity={0.24} />
            <RoundedBox args={[0.55, 0.55, 0.55]} radius={0.1} smoothness={3} position={[0, 0.3, 0]}><meshToonMaterial color="#d2a878" gradientMap={grad()} /></RoundedBox>
            {active && <TargetMarker />}
        </group>
    );
}

export function duolingoPropFor(it: Interactable, o: { active: boolean; open: boolean; onClick: () => void }) {
    const tag = `${it.emoji || ''} ${it.id} ${it.label}`.toLowerCase();
    const kind = (it as { kind?: string }).kind
        || (/🌳|🌲|tree|árbol|arbol/.test(tag) ? 'tree'
            : /⛲|fountain|fuente/.test(tag) ? 'fountain'
                : /🧰|📦|🎁|chest|cofre|baúl|baul/.test(tag) ? 'chest'
                    : /🪑|bench|banca/.test(tag) ? 'bench' : 'crate');
    const common = { position: [it.x, 0, it.y] as [number, number, number], active: o.active, onClick: o.onClick };
    switch (kind) {
        case 'tree': return <DuolingoTree key={it.id} {...common} />;
        case 'fountain': return <DuolingoFountain key={it.id} {...common} />;
        case 'chest': return <DuolingoChest key={it.id} {...common} open={o.open} />;
        case 'bench': return <DuolingoBench key={it.id} {...common} />;
        default: return <DuolingoCrate key={it.id} {...common} />;
    }
}
