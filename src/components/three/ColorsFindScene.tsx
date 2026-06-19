'use client';
// Escena 3D de la actividad "Colores" (identidad propia Ludora: limpio, brillante, redondeado-glossy, vertical).
// Objetos reconocibles de colores en una rejilla; tocas el correcto → premia. Reusable: una ronda por instancia.
import { useMemo, useRef } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, RoundedBox, Float } from '@react-three/drei';
import * as THREE from 'three';

export type ColorObj = { id: string; shape: string; color: string; label?: string };
export type RoundStatus = 'playing' | 'right' | 'wrong';

// Geometría de estrella biselada (independiente del color → singleton).
let _star: THREE.ExtrudeGeometry | null = null;
function starGeo(): THREE.ExtrudeGeometry {
    if (!_star) {
        const s = new THREE.Shape();
        const spikes = 5, outer = 0.5, inner = 0.21;
        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outer : inner;
            const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(a) * r, y = Math.sin(a) * r;
            i === 0 ? s.moveTo(x, y) : s.lineTo(x, y);
        }
        s.closePath();
        const g = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 });
        g.center();
        _star = g;
    }
    return _star;
}

function Shape({ shape, color }: { shape: string; color: string }) {
    const mat = <meshStandardMaterial color={color} roughness={0.4} metalness={0.05} />;
    switch (shape) {
        case 'apple':
            return (
                <group>
                    <mesh position={[0, 0.42, 0]} scale={[1, 0.92, 1]}><sphereGeometry args={[0.42, 28, 22]} />{mat}</mesh>
                    <mesh position={[0.04, 0.82, 0]} rotation={[0, 0, 0.2]}><cylinderGeometry args={[0.03, 0.03, 0.18, 8]} /><meshStandardMaterial color="#7a5230" roughness={0.7} /></mesh>
                    <mesh position={[0.16, 0.84, 0.02]} rotation={[0.3, 0, -0.5]} scale={[1, 0.5, 0.6]}><sphereGeometry args={[0.1, 12, 10]} /><meshStandardMaterial color="#5fb257" roughness={0.5} /></mesh>
                </group>
            );
        case 'star':
            return <mesh geometry={starGeo()} position={[0, 0.55, 0]}>{mat}</mesh>;
        case 'balloon':
            return (
                <group>
                    <mesh position={[0, 0.72, 0]} scale={[0.92, 1.08, 0.92]}><sphereGeometry args={[0.4, 26, 20]} />{mat}</mesh>
                    <mesh position={[0, 0.32, 0]}><cylinderGeometry args={[0.012, 0.012, 0.5, 6]} /><meshStandardMaterial color="#b9b9c4" roughness={0.8} /></mesh>
                    <mesh position={[0, 0.5, 0]}><coneGeometry args={[0.05, 0.08, 8]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
                </group>
            );
        case 'block':
            return <RoundedBox args={[0.74, 0.74, 0.74]} radius={0.12} smoothness={4} position={[0, 0.4, 0]}>{mat}</RoundedBox>;
        case 'flower':
            return (
                <group position={[0, 0.5, 0]}>
                    {[0, 1, 2, 3, 4].map((i) => {
                        const a = (i / 5) * Math.PI * 2;
                        return <mesh key={i} position={[Math.cos(a) * 0.26, 0, Math.sin(a) * 0.26]} scale={[0.24, 0.12, 0.24]}><sphereGeometry args={[1, 14, 12]} />{<meshStandardMaterial color={color} roughness={0.45} />}</mesh>;
                    })}
                    <mesh><sphereGeometry args={[0.16, 16, 14]} /><meshStandardMaterial color="#ffd23f" roughness={0.4} /></mesh>
                    <mesh position={[0, -0.4, 0]}><cylinderGeometry args={[0.04, 0.04, 0.5, 8]} /><meshStandardMaterial color="#5fb257" roughness={0.6} /></mesh>
                </group>
            );
        case 'ball':
        default:
            return <mesh position={[0, 0.44, 0]}><sphereGeometry args={[0.44, 30, 24]} />{mat}</mesh>;
    }
}

function ColorObject({ obj, position, status, picked, onPick, disabled }: {
    obj: ColorObj; position: [number, number, number]; status: RoundStatus; picked: string | null; onPick: (id: string) => void; disabled: boolean;
}) {
    const g = useRef<THREE.Group>(null);
    const t = useRef(Math.random() * 10);
    const isPicked = picked === obj.id;
    const isRight = status === 'right' && isPicked;
    const isWrong = status === 'wrong' && isPicked;
    const dim = status !== 'playing' && !isPicked;

    useFrame((_, dt) => {
        const m = g.current; if (!m) return;
        t.current += dt;
        const baseY = position[1];
        let scale = dim ? 0.82 : 1;
        let y = baseY + Math.sin(t.current * 1.6) * 0.04;       // idle bob
        m.rotation.y += dt * 0.4;
        if (isRight) { scale = 1.28; y = baseY + 0.35 + Math.sin(t.current * 6) * 0.05; m.rotation.y += dt * 2; }
        if (isWrong) { m.rotation.z = Math.sin(t.current * 30) * 0.18; } else { m.rotation.z += (0 - m.rotation.z) * Math.min(1, dt * 8); }
        const s = m.scale.x + (scale - m.scale.x) * Math.min(1, dt * 10);
        m.scale.setScalar(s);
        m.position.y = y;
    });

    return (
        <group ref={g} position={position}
            onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (!disabled && status === 'playing') onPick(obj.id); }}
            onPointerOver={() => { if (!disabled && status === 'playing') document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}>
            <Shape shape={obj.shape} color={obj.color} />
            {isRight && (
                <Float speed={6} floatIntensity={1.2} rotationIntensity={1}>
                    <mesh geometry={starGeo()} position={[0, 1.35, 0]} scale={0.5}>
                        <meshStandardMaterial color="#ffd23f" emissive="#ffb703" emissiveIntensity={0.6} roughness={0.3} />
                    </mesh>
                </Float>
            )}
        </group>
    );
}

export default function ColorsFindScene({ objects, status, picked, onPick, disabled = false }: {
    objects: ColorObj[]; status: RoundStatus; picked: string | null; onPick: (id: string) => void; disabled?: boolean;
}) {
    // Rejilla 2 columnas (encaja en vertical). Centrada en el origen.
    const layout = useMemo(() => {
        const cols = objects.length <= 3 ? objects.length : 2;
        const rows = Math.ceil(objects.length / cols);
        const sx = 1.5, sz = 1.5;
        return objects.map((o, i) => {
            const c = i % cols, r = Math.floor(i / cols);
            const x = (c - (cols - 1) / 2) * sx;
            const z = (r - (rows - 1) / 2) * sz;
            return { o, pos: [x, 0, z] as [number, number, number] };
        });
    }, [objects]);

    return (
        <Canvas
            dpr={[1, typeof window !== 'undefined' ? Math.min(1.8, window.devicePixelRatio) : 1]}
            camera={{ position: [0, 3.4, 4.6], fov: 42, near: 0.1, far: 100 }}
            onCreated={({ camera }) => camera.lookAt(0, 0.35, 0)}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            style={{ width: '100%', height: '100%' }}
        >
            <color attach="background" args={['#eef1ff']} />
            <ambientLight intensity={0.85} />
            <hemisphereLight args={['#ffffff', '#e7e0ff', 0.5]} />
            <directionalLight position={[3, 6, 4]} intensity={0.9} />
            {/* piso suave + sombra de contacto que aterriza los objetos */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
                <circleGeometry args={[6, 48]} />
                <meshStandardMaterial color="#f6f4ff" roughness={1} />
            </mesh>
            <ContactShadows position={[0, 0.01, 0]} scale={8} blur={2.4} opacity={0.28} far={4} resolution={256} />
            {layout.map(({ o, pos }) => (
                <ColorObject key={o.id} obj={o} position={pos} status={status} picked={picked} onPick={onPick} disabled={disabled} />
            ))}
        </Canvas>
    );
}
