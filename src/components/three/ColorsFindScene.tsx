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
    switch (shape) {
        case 'apple':   // manzana (recoloreable: roja, dorada, verde…)
            return (
                <group>
                    <mesh position={[0, 0.42, 0]} scale={[1, 0.92, 1]}><sphereGeometry args={[0.42, 28, 22]} /><meshStandardMaterial color={color} roughness={0.38} /></mesh>
                    <mesh position={[0.04, 0.82, 0]} rotation={[0, 0, 0.2]}><cylinderGeometry args={[0.03, 0.03, 0.18, 8]} /><meshStandardMaterial color="#7a5230" roughness={0.7} /></mesh>
                    <mesh position={[0.16, 0.84, 0.02]} rotation={[0.3, 0, -0.5]} scale={[1, 0.5, 0.6]}><sphereGeometry args={[0.1, 12, 10]} /><meshStandardMaterial color="#5fb257" roughness={0.5} /></mesh>
                </group>
            );
        case 'gem':   // gema/diamante (octaedro facetado, brillante): diamante/esmeralda/lapis/amatista por color
            return (
                <mesh position={[0, 0.55, 0]} scale={[0.78, 1.05, 0.78]}>
                    <octahedronGeometry args={[0.5, 0]} />
                    <meshStandardMaterial color={color} roughness={0.12} metalness={0.2} flatShading />
                </mesh>
            );
        case 'ingot':   // lingote metálico (oro/hierro)
            return (
                <group position={[0, 0.2, 0]}>
                    <mesh><boxGeometry args={[0.7, 0.24, 0.42]} /><meshStandardMaterial color={color} roughness={0.28} metalness={0.3} /></mesh>
                    <mesh position={[0, 0.15, 0]}><boxGeometry args={[0.56, 0.08, 0.3]} /><meshStandardMaterial color={color} roughness={0.28} metalness={0.3} /></mesh>
                </group>
            );
        case 'pig':   // cerdo blocky estilo Minecraft (mira hacia la cámara)
            return (
                <group>
                    <mesh position={[0, 0.42, -0.05]}><boxGeometry args={[0.5, 0.42, 0.66]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
                    <mesh position={[0, 0.5, 0.42]}><boxGeometry args={[0.42, 0.42, 0.34]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
                    <mesh position={[0, 0.46, 0.6]}><boxGeometry args={[0.2, 0.16, 0.08]} /><meshStandardMaterial color="#d76b86" roughness={0.6} /></mesh>
                    <mesh position={[-0.05, 0.46, 0.64]}><boxGeometry args={[0.05, 0.05, 0.02]} /><meshStandardMaterial color="#5a2330" /></mesh>
                    <mesh position={[0.05, 0.46, 0.64]}><boxGeometry args={[0.05, 0.05, 0.02]} /><meshStandardMaterial color="#5a2330" /></mesh>
                    <mesh position={[-0.13, 0.66, 0.46]}><boxGeometry args={[0.1, 0.1, 0.06]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
                    <mesh position={[0.13, 0.66, 0.46]}><boxGeometry args={[0.1, 0.1, 0.06]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
                    {([[-0.16, -0.12], [0.16, -0.12], [-0.16, 0.18], [0.16, 0.18]] as [number, number][]).map(([x, z], i) => (
                        <mesh key={i} position={[x, 0.1, z]}><boxGeometry args={[0.14, 0.2, 0.14]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
                    ))}
                </group>
            );
        case 'pumpkin':   // calabaza (jack-o'-lantern)
            return (
                <group position={[0, 0.42, 0]}>
                    <mesh scale={[1, 0.85, 1]}><sphereGeometry args={[0.46, 22, 18]} /><meshStandardMaterial color={color} roughness={0.55} /></mesh>
                    <mesh position={[0, 0.42, 0]}><cylinderGeometry args={[0.06, 0.08, 0.14, 8]} /><meshStandardMaterial color="#5fb257" roughness={0.6} /></mesh>
                    <mesh position={[-0.14, 0.04, 0.4]} rotation={[0, 0, 0.6]}><boxGeometry args={[0.13, 0.1, 0.04]} /><meshStandardMaterial color="#3a2410" /></mesh>
                    <mesh position={[0.14, 0.04, 0.4]} rotation={[0, 0, -0.6]}><boxGeometry args={[0.13, 0.1, 0.04]} /><meshStandardMaterial color="#3a2410" /></mesh>
                    <mesh position={[0, -0.14, 0.42]}><boxGeometry args={[0.26, 0.07, 0.04]} /><meshStandardMaterial color="#3a2410" /></mesh>
                </group>
            );
        case 'block':
        default:   // bloque tipo Minecraft (recoloreable)
            return <RoundedBox args={[0.72, 0.72, 0.72]} radius={0.05} smoothness={3} position={[0, 0.4, 0]}><meshStandardMaterial color={color} roughness={0.55} /></RoundedBox>;
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
            <color attach="background" args={['#cdeafe']} />
            <ambientLight intensity={0.8} />
            <hemisphereLight args={['#ffffff', '#cfe9b5', 0.45]} />
            <directionalLight position={[3, 6, 4]} intensity={1.0} />
            <directionalLight position={[-4, 3, -2]} intensity={0.25} />
            {/* losa tipo "arenisca" (neutra → los colores resaltan) + sombra de contacto */}
            <RoundedBox args={[7, 0.6, 7]} radius={0.12} smoothness={3} position={[0, -0.32, 0]}>
                <meshStandardMaterial color="#e8ddc0" roughness={0.95} />
            </RoundedBox>
            <ContactShadows position={[0, 0.01, 0]} scale={8} blur={2.4} opacity={0.3} far={4} resolution={256} />
            {layout.map(({ o, pos }) => (
                <ColorObject key={o.id} obj={o} position={pos} status={status} picked={picked} onPick={onPick} disabled={disabled} />
            ))}
        </Canvas>
    );
}
