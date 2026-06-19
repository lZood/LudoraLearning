'use client';
// Rig blocky (cabeza/torso/brazos/piernas de cubos) con skin del pack. El jugador camina (lerp
// entre casillas + swing de extremidades + bob). Los NPC quedan estáticos con un leve idle.
import { useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { skinTex } from '@/lib/voxel/textures';
import type { CharSkin } from '@/lib/voxel/skins';

type Props = {
    data: CharSkin;
    target: [number, number, number];          // coords de mundo (x,0,z)
    player?: boolean;
    bubble?: boolean;                            // 💬 sobre la cabeza (NPC no hablado)
    onClick?: (e: ThreeEvent<MouseEvent>) => void;
};

export default function VoxelCharacter({ data, target, player = false, bubble = false, onClick }: Props) {
    const group = useRef<THREE.Group>(null);
    const legL = useRef<THREE.Group>(null);
    const legR = useRef<THREE.Group>(null);
    const armL = useRef<THREE.Group>(null);
    const armR = useRef<THREE.Group>(null);
    const init = useRef(false);
    const t = useRef(0);

    useFrame((_, dt) => {
        const g = group.current; if (!g) return;
        if (!init.current) { g.position.set(target[0], 0, target[2]); init.current = true; }
        const k = Math.min(1, dt * 9);
        g.position.x += (target[0] - g.position.x) * k;
        g.position.z += (target[2] - g.position.z) * k;
        const dist = Math.hypot(target[0] - g.position.x, target[2] - g.position.z);
        const walking = player && dist > 0.03;
        t.current += dt * (walking ? 11 : 2.5);
        const swing = walking ? Math.sin(t.current) * 0.6 : Math.sin(t.current) * 0.05;
        if (legL.current) legL.current.rotation.x = swing;
        if (legR.current) legR.current.rotation.x = -swing;
        if (armL.current) armL.current.rotation.x = -swing * 0.8;
        if (armR.current) armR.current.rotation.x = swing * 0.8;
        g.position.y = walking ? Math.abs(Math.sin(t.current)) * 0.06 : 0;
    });

    const skin = data.skin;
    return (
        <group
            ref={group}
            onClick={onClick ? (e) => { e.stopPropagation(); onClick(e); } : undefined}
            onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer'; } : undefined}
            onPointerOut={onClick ? () => { document.body.style.cursor = 'auto'; } : undefined}
        >
            {/* piernas (pivote en la cadera) */}
            <group ref={legL} position={[-0.12, 0.55, 0]}>
                <mesh position={[0, -0.275, 0]}><boxGeometry args={[0.22, 0.55, 0.26]} /><meshStandardMaterial color={data.pants} /></mesh>
            </group>
            <group ref={legR} position={[0.12, 0.55, 0]}>
                <mesh position={[0, -0.275, 0]}><boxGeometry args={[0.22, 0.55, 0.26]} /><meshStandardMaterial color={data.pants} /></mesh>
            </group>
            {/* torso */}
            <mesh position={[0, 0.85, 0]}><boxGeometry args={[0.5, 0.6, 0.3]} /><meshStandardMaterial color={data.shirt} /></mesh>
            {/* brazos (pivote en el hombro) */}
            <group ref={armL} position={[-0.33, 1.12, 0]}>
                <mesh position={[0, -0.27, 0]}><boxGeometry args={[0.16, 0.55, 0.24]} /><meshStandardMaterial color={data.shirt} /></mesh>
            </group>
            <group ref={armR} position={[0.33, 1.12, 0]}>
                <mesh position={[0, -0.27, 0]}><boxGeometry args={[0.16, 0.55, 0.24]} /><meshStandardMaterial color={data.shirt} /></mesh>
            </group>
            {/* cabeza: cara (PNG) en +Z, resto color piel */}
            <mesh position={[0, 1.42, 0]}>
                <boxGeometry args={[0.52, 0.52, 0.52]} />
                <meshStandardMaterial attach="material-0" color={skin} />
                <meshStandardMaterial attach="material-1" color={skin} />
                <meshStandardMaterial attach="material-2" color={skin} />
                <meshStandardMaterial attach="material-3" color={skin} />
                <meshStandardMaterial attach="material-4" map={skinTex(data.face)} />
                <meshStandardMaterial attach="material-5" color={skin} />
            </mesh>
            {bubble && (
                <Html position={[0, 2.05, 0]} center distanceFactor={10} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    <div style={{ fontSize: 22, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.4))' }}>💬</div>
                </Html>
            )}
        </group>
    );
}
