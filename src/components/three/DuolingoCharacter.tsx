'use client';
// Personaje redondeado estilo Duolingo: cabezota redonda + cara tierna + cuerpo/extremidades cápsula, toon pastel.
// Reusa la animación del rig voxel (lerp al objetivo + swing de extremidades + bob), SIN huesos.
import { useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { toonGradient, BlobShadow } from './toon';
import type { CharSkin } from '@/lib/voxel/skins';

type Props = {
    data: CharSkin;
    target: [number, number, number];
    player?: boolean;
    bubble?: boolean;
    onClick?: (e: ThreeEvent<MouseEvent>) => void;
};

export default function DuolingoCharacter({ data, target, player = false, bubble = false, onClick }: Props) {
    const group = useRef<THREE.Group>(null);
    const legL = useRef<THREE.Group>(null);
    const legR = useRef<THREE.Group>(null);
    const armL = useRef<THREE.Group>(null);
    const armR = useRef<THREE.Group>(null);
    const init = useRef(false);
    const t = useRef(0);
    const grad = toonGradient();

    useFrame((_, dt) => {
        const g = group.current; if (!g) return;
        if (!init.current) { g.position.set(target[0], 0, target[2]); init.current = true; }
        const k = Math.min(1, dt * 9);
        g.position.x += (target[0] - g.position.x) * k;
        g.position.z += (target[2] - g.position.z) * k;
        const dist = Math.hypot(target[0] - g.position.x, target[2] - g.position.z);
        const walking = player && dist > 0.03;
        t.current += dt * (walking ? 10 : 2.2);
        const sw = walking ? Math.sin(t.current) * 0.55 : Math.sin(t.current) * 0.05;
        if (legL.current) legL.current.rotation.x = sw;
        if (legR.current) legR.current.rotation.x = -sw;
        if (armL.current) armL.current.rotation.x = -sw * 0.7;
        if (armR.current) armR.current.rotation.x = sw * 0.7;
        g.position.y = walking ? Math.abs(Math.sin(t.current)) * 0.07 : 0;
    });

    return (
        <group ref={group}
            onClick={onClick ? (e) => { e.stopPropagation(); onClick(e); } : undefined}
            onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer'; } : undefined}
            onPointerOut={onClick ? () => { document.body.style.cursor = 'auto'; } : undefined}>
            <BlobShadow radius={0.4} />
            {/* piernas */}
            <group ref={legL} position={[-0.13, 0.5, 0]}><mesh position={[0, -0.22, 0]}><capsuleGeometry args={[0.1, 0.2, 4, 10]} /><meshToonMaterial color={data.pants} gradientMap={grad} /></mesh></group>
            <group ref={legR} position={[0.13, 0.5, 0]}><mesh position={[0, -0.22, 0]}><capsuleGeometry args={[0.1, 0.2, 4, 10]} /><meshToonMaterial color={data.pants} gradientMap={grad} /></mesh></group>
            {/* cuerpo regordete */}
            <mesh position={[0, 0.82, 0]}><capsuleGeometry args={[0.27, 0.32, 6, 14]} /><meshToonMaterial color={data.shirt} gradientMap={grad} /></mesh>
            {/* brazos */}
            <group ref={armL} position={[-0.3, 1.02, 0]}><mesh position={[0, -0.2, 0]}><capsuleGeometry args={[0.08, 0.26, 4, 10]} /><meshToonMaterial color={data.shirt} gradientMap={grad} /></mesh></group>
            <group ref={armR} position={[0.3, 1.02, 0]}><mesh position={[0, -0.2, 0]}><capsuleGeometry args={[0.08, 0.26, 4, 10]} /><meshToonMaterial color={data.shirt} gradientMap={grad} /></mesh></group>
            {/* cabeza redonda grande + cara tierna */}
            <group position={[0, 1.5, 0]}>
                <mesh scale={[0.36, 0.38, 0.34]}><sphereGeometry args={[1, 24, 18]} /><meshToonMaterial color={data.skin} gradientMap={grad} /></mesh>
                <mesh position={[-0.12, 0.02, 0.3]}><sphereGeometry args={[0.07, 12, 10]} /><meshBasicMaterial color="#ffffff" /></mesh>
                <mesh position={[0.12, 0.02, 0.3]}><sphereGeometry args={[0.07, 12, 10]} /><meshBasicMaterial color="#ffffff" /></mesh>
                <mesh position={[-0.12, 0.02, 0.34]}><sphereGeometry args={[0.035, 10, 8]} /><meshBasicMaterial color="#3a2c22" /></mesh>
                <mesh position={[0.12, 0.02, 0.34]}><sphereGeometry args={[0.035, 10, 8]} /><meshBasicMaterial color="#3a2c22" /></mesh>
                <mesh position={[-0.2, -0.08, 0.27]} scale={[1, 0.7, 0.4]}><sphereGeometry args={[0.05, 10, 8]} /><meshBasicMaterial color="#f3a9a0" /></mesh>
                <mesh position={[0.2, -0.08, 0.27]} scale={[1, 0.7, 0.4]}><sphereGeometry args={[0.05, 10, 8]} /><meshBasicMaterial color="#f3a9a0" /></mesh>
                <mesh position={[0, -0.11, 0.31]} scale={[1.5, 0.7, 0.5]}><sphereGeometry args={[0.04, 10, 8]} /><meshBasicMaterial color="#b5654a" /></mesh>
            </group>
            {bubble && (
                <Html position={[0, 2.05, 0]} center distanceFactor={9} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    <div style={{ fontSize: 22, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.4))' }}>💬</div>
                </Html>
            )}
        </group>
    );
}
