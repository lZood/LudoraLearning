'use client';
// Tablero 2D original (CSS grid + emojis). Se usa como FALLBACK cuando WebGL no está disponible.
import React from 'react';
import { motion } from 'framer-motion';
import type { Adventure, NPC, Interactable } from '@/lib/adventures';
import type { Pos } from '@/hooks/useAdventureEngine';

type Props = {
    A: Adventure;
    pos: Pos;
    talked: Set<string>;
    keyFound: boolean;
    goTo: (x: number, y: number) => void;
    talkTo: (n: NPC) => void;
    interact: (it: Interactable) => void;
};

export default function Adventure2DBoard({ A, pos, talked, keyFound, goTo, talkTo, interact }: Props) {
    return (
        <div className="flex-1 flex items-center justify-center p-3">
            <div className="relative w-full" style={{ maxWidth: 420, aspectRatio: `${A.cols}/${A.rows}` }}>
                {/* Tiles */}
                <div className="absolute inset-0 grid rounded-2xl overflow-hidden" style={{ gridTemplateColumns: `repeat(${A.cols}, 1fr)` }}>
                    {Array.from({ length: A.cols * A.rows }).map((_, k) => {
                        const x = k % A.cols, y = Math.floor(k / A.cols);
                        const isWall = A.grid[y][x] === '#';
                        return (
                            <button key={k} onClick={() => goTo(x, y)} disabled={isWall}
                                className={`${isWall ? 'bg-[#2e6b2a]' : (x + y) % 2 ? 'bg-[#9be25e]' : 'bg-[#8ed94f]'}`}
                                style={{ aspectRatio: '1' }} aria-hidden />
                        );
                    })}
                </div>
                {/* Interactuables */}
                {A.interactables.map((it) => {
                    const active = it.id === A.keyLocation ? (talked.size >= 2 && !keyFound) : it.id === A.chestId ? keyFound : false;
                    return (
                        <button key={it.id} onClick={() => interact(it)}
                            className="absolute flex items-center justify-center"
                            style={{ left: `${(it.x * 100) / A.cols}%`, top: `${(it.y * 100) / A.rows}%`, width: `${100 / A.cols}%`, height: `${100 / A.rows}%` }}>
                            <span className={`text-2xl ${active ? 'animate-bounce drop-shadow-[0_0_8px_rgba(255,255,150,0.9)]' : ''}`}>{it.emoji}</span>
                        </button>
                    );
                })}
                {/* NPCs */}
                {A.npcs.map((n) => (
                    <button key={n.id} onClick={() => talkTo(n)}
                        className="absolute flex flex-col items-center justify-center"
                        style={{ left: `${(n.x * 100) / A.cols}%`, top: `${(n.y * 100) / A.rows}%`, width: `${100 / A.cols}%`, height: `${100 / A.rows}%` }}>
                        <span className="text-2xl">{n.emoji}</span>
                        {!talked.has(n.id) && <span className="absolute -top-1 text-xs animate-bounce">💬</span>}
                    </button>
                ))}
                {/* Avatar */}
                <motion.div className="absolute flex items-center justify-center pointer-events-none z-10"
                    animate={{ left: `${(pos.x * 100) / A.cols}%`, top: `${(pos.y * 100) / A.rows}%` }}
                    transition={{ duration: 0.14, ease: 'linear' }}
                    style={{ width: `${100 / A.cols}%`, height: `${100 / A.rows}%` }}>
                    <span className="text-2xl drop-shadow">🧍</span>
                </motion.div>
            </div>
        </div>
    );
}
