'use client';
// Ensamblado del renderer 3D: Canvas R3F + cámara 3/4 + luces + mundo + props + NPCs + jugador.
// Solo LEE el estado del motor y dispara callbacks (onTile/onNpc/onInteract) — la lógica vive en el hook.
import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import VoxelWorld from './VoxelWorld';
import VoxelCharacter from './VoxelCharacter';
import { propFor } from './props';
import { CHAR_SKIN, PLAYER_SKIN } from '@/lib/voxel/skins';
import { THEME, type WorldTheme } from '@/lib/voxel/blocks';
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

export default function VoxelAdventureCanvas({ A, pos, talked, keyFound, chestOpen, onTile, onNpc, onInteract }: Props) {
    const theme: WorldTheme = (A as { theme?: WorldTheme }).theme ?? 'overworld';
    const cx = (A.cols - 1) / 2, cz = (A.rows - 1) / 2;
    const span = Math.max(A.cols, A.rows);
    const dpr = useMemo<[number, number]>(() => [1, typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio * 0.85) : 1], []);

    return (
        <div className="flex-1 w-full" style={{ minHeight: 0 }}>
            <Canvas
                dpr={dpr}
                camera={{ position: [cx, span * 1.3, cz + span * 1.25], fov: 42, near: 0.1, far: 300 }}
                gl={{ antialias: true, powerPreference: 'high-performance' }}
                onCreated={({ camera }) => camera.lookAt(cx, 0, cz)}
                style={{ width: '100%', height: '100%' }}
            >
                <color attach="background" args={[THEME[theme].sky]} />
                {/* 2 luces (móvil): relleno hemisférico + sol direccional, sin sombras */}
                <hemisphereLight args={['#ffffff', '#6a8f5a', 0.95]} />
                <directionalLight position={[cx + span, span * 1.6, cz + span * 0.4]} intensity={0.95} />
                <Suspense fallback={null}>
                    <VoxelWorld A={A} theme={theme} onTile={onTile} />
                    {A.interactables.map((it) => propFor(it, {
                        active: it.id === A.keyLocation ? (talked.size >= 2 && !keyFound) : it.id === A.chestId ? keyFound : false,
                        open: it.id === A.chestId ? chestOpen : false,
                        onClick: () => onInteract(it),
                    }))}
                    {A.npcs.map((n) => (
                        <VoxelCharacter key={n.id} data={CHAR_SKIN[n.char]} target={[n.x, 0, n.y]} bubble={!talked.has(n.id)} onClick={() => onNpc(n)} />
                    ))}
                    <VoxelCharacter data={PLAYER_SKIN} target={[pos.x, 0, pos.y]} player />
                </Suspense>
            </Canvas>
        </div>
    );
}
