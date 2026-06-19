'use client';
// Ensamblado del renderer estilo Duolingo: Canvas flat + cámara cenital (FOV bajo, ángulo alto) +
// luces suaves SIN shadow maps + tablero damero + props/personajes redondeados toon. Drop-in:
// misma firma que VoxelAdventureCanvas (lee el estado del motor, dispara onTile/onNpc/onInteract).
import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import DuolingoWorld, { TileHighlight } from './DuolingoWorld';
import DuolingoCharacter from './DuolingoCharacter';
import { duolingoPropFor } from './props/duolingo';
import { CHAR_SKIN, PLAYER_SKIN } from '@/lib/voxel/skins';
import type { Adventure, NPC, Interactable } from '@/lib/adventures';
import type { Pos } from '@/hooks/useAdventureEngine';

type Props = {
    A: Adventure;
    pos: Pos;
    talked: Set<string>;
    keyFound: boolean;
    chestOpen: boolean;
    onTile: (x: number, y: number) => void;
    onNpc: (n: NPC) => void;
    onInteract: (it: Interactable) => void;
};

export default function DuolingoAdventureCanvas({ A, pos, talked, keyFound, chestOpen, onTile, onNpc, onInteract }: Props) {
    const cx = (A.cols - 1) / 2, cz = (A.rows - 1) / 2;
    const span = Math.max(A.cols, A.rows);
    const dpr = useMemo<[number, number]>(() => [1, typeof window !== 'undefined' ? Math.min(1.7, window.devicePixelRatio) : 1], []);
    const [hover, setHover] = useState<[number, number] | null>(null);
    const onHover = (x: number, y: number) => setHover(x < 0 ? null : [x, y]);

    return (
        <div className="flex-1 w-full" style={{ minHeight: 0 }}>
            <Canvas
                flat
                dpr={dpr}
                camera={{ position: [cx, span * 1.35, cz + span * 0.72], fov: 30, near: 0.1, far: 300 }}
                onCreated={({ camera }) => camera.lookAt(cx, 0, cz)}
                gl={{ antialias: true, powerPreference: 'high-performance' }}
                style={{ width: '100%', height: '100%' }}
            >
                <color attach="background" args={['#eaf6ff']} />
                {/* luces flat suaves, sin sombras de mapa (la banda toon la da la directional) */}
                <ambientLight intensity={0.9} />
                <hemisphereLight args={['#ffffff', '#cfe9b5', 0.5]} />
                <directionalLight position={[cx + span * 0.4, span * 1.5, cz + span * 0.2]} intensity={0.75} />
                <Suspense fallback={null}>
                    <DuolingoWorld A={A} onTile={onTile} onHover={onHover} />
                    <TileHighlight pos={hover} />
                    {A.interactables.map((it) => duolingoPropFor(it, {
                        active: it.id === A.keyLocation ? (talked.size >= 2 && !keyFound) : it.id === A.chestId ? keyFound : false,
                        open: it.id === A.chestId ? chestOpen : false,
                        onClick: () => onInteract(it),
                    }))}
                    {A.npcs.map((n) => (
                        <DuolingoCharacter key={n.id} data={CHAR_SKIN[n.char]} target={[n.x, 0, n.y]} bubble={!talked.has(n.id)} onClick={() => onNpc(n)} />
                    ))}
                    <DuolingoCharacter data={PLAYER_SKIN} target={[pos.x, 0, pos.y]} player />
                </Suspense>
            </Canvas>
        </div>
    );
}
