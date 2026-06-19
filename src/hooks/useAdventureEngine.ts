'use client';
// Motor de Aventuras (renderer-agnóstico): toda la lógica de juego vive aquí.
// El render (2D emoji o 3D voxel) solo lee este estado y llama estas acciones.
import { useCallback, useEffect, useRef, useState } from 'react';
import { playAudio, loadAudioManifest, stopAudio, playSfx } from '@/lib/lessonAudio';
import type { Adventure, NPC, Interactable, DialogueOption } from '@/lib/adventures';

export type Step = 'intro' | 'playing' | 'finishing' | 'complete' | 'missing';
export type Pos = { x: number; y: number };

const speak = (text: string, role: string) => playAudio(text, role);

export function useAdventureEngine(A: Adventure | undefined) {
    const [step, setStep] = useState<Step>(A ? 'intro' : 'missing');
    const [pos, setPos] = useState<Pos>(A ? A.start : { x: 0, y: 0 });
    const [talked, setTalked] = useState<Set<string>>(new Set());
    const [keyFound, setKeyFound] = useState(false);
    const [chestOpen, setChestOpen] = useState(false);
    const [reward, setReward] = useState<{ xp: number; coins: number } | null>(null);

    // Conversación
    const [npc, setNpc] = useState<NPC | null>(null);
    const [cstage, setCstage] = useState<'intro' | 'ask' | 'reply'>('intro');
    const [reply, setReply] = useState<DialogueOption | null>(null);
    const [nudge, setNudge] = useState(false);
    // Interactuable (resultado de buscar)
    const [toast, setToast] = useState<{ line: string; es?: string; role?: string } | null>(null);
    // Para animar el caminar en 3D
    const [moving, setMoving] = useState(false);

    const movingRef = useRef(false);
    const pendingRef = useRef<null | (() => void)>(null);

    useEffect(() => { loadAudioManifest(); return () => stopAudio(); }, []);

    // ── Mapa / caminos ──
    const npcAt = (x: number, y: number) => A?.npcs.find((n) => n.x === x && n.y === y);
    const interAt = (x: number, y: number) => A?.interactables.find((it) => it.x === x && it.y === y);
    const wall = (x: number, y: number) => !A || x < 0 || y < 0 || x >= A.cols || y >= A.rows || A.grid[y][x] === '#';
    const walkable = (x: number, y: number) => !wall(x, y) && !npcAt(x, y) && !interAt(x, y);

    const bfs = useCallback((from: Pos, to: Pos): Pos[] => {
        if (!A || !walkable(to.x, to.y)) return [];
        const key = (p: Pos) => `${p.x},${p.y}`;
        const q: Pos[] = [from]; const prev = new Map<string, Pos | null>(); prev.set(key(from), null);
        while (q.length) {
            const c = q.shift()!;
            if (c.x === to.x && c.y === to.y) break;
            for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
                const nx = c.x + dx, ny = c.y + dy;
                if (walkable(nx, ny) && !prev.has(`${nx},${ny}`)) { prev.set(`${nx},${ny}`, c); q.push({ x: nx, y: ny }); }
            }
        }
        if (!prev.has(key(to))) return [];
        const path: Pos[] = []; let cur: Pos | null = to;
        while (cur) { path.unshift(cur); cur = prev.get(key(cur)) ?? null; }
        path.shift();
        return path;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [A]);

    const adjacentTo = useCallback((t: Pos): Pos | null => {
        const opts = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([dx, dy]) => ({ x: t.x + dx, y: t.y + dy })).filter((p) => walkable(p.x, p.y));
        if (!opts.length) return null;
        opts.sort((a, b) => (Math.abs(a.x - pos.x) + Math.abs(a.y - pos.y)) - (Math.abs(b.x - pos.x) + Math.abs(b.y - pos.y)));
        return opts[0];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pos, A]);

    const walkPath = useCallback((path: Pos[], onArrive?: () => void) => {
        if (movingRef.current || !path.length) { onArrive?.(); return; }
        movingRef.current = true; setMoving(true);
        let i = 0;
        const stepFn = () => {
            if (i >= path.length) { movingRef.current = false; setMoving(false); onArrive?.(); return; }
            setPos(path[i]); i++;
            setTimeout(stepFn, 150);
        };
        stepFn();
    }, []);

    const goTo = (x: number, y: number) => {
        if (step !== 'playing' || npc || toast) return;
        walkPath(bfs(pos, { x, y }));
    };
    const approach = (t: Pos, onArrive: () => void) => {
        if (step !== 'playing' || npc || toast || movingRef.current) return;
        const adj = adjacentTo(t);
        if (!adj) { onArrive(); return; }
        walkPath(bfs(pos, adj), onArrive);
    };

    // ── Conversación ──
    function talkTo(n: NPC) {
        approach({ x: n.x, y: n.y }, () => { setNpc(n); setCstage('intro'); setReply(null); setNudge(false); });
    }
    useEffect(() => {
        if (!npc) return;
        if (cstage === 'intro') speak(npc.greeting, npc.char);
        else if (cstage === 'ask') speak(npc.ask, npc.char);
        else if (cstage === 'reply' && reply?.reply) speak(reply.reply, npc.char);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [npc, cstage]);

    function pick(o: DialogueOption) {
        if (!npc) return;
        if (o.correct) { playSfx('correct'); setReply(o); setCstage('reply'); }
        else { playSfx('wrong'); setNudge(true); setTimeout(() => setNudge(false), 1400); }
    }
    function closeConvo() {
        if (npc && reply?.correct) setTalked((t) => new Set(t).add(npc.id));
        stopAudio(); setNpc(null); setReply(null);
    }

    // ── Interactuables / acertijo ──
    function interact(it: Interactable) {
        if (!A) return;
        approach({ x: it.x, y: it.y }, () => {
            if (it.id === A.chestId) {
                if (!keyFound) { setToast({ line: A.chestLockedLine, es: A.chestLockedEs, role: 'narrator' }); speak(A.chestLockedLine, 'narrator'); return; }
                setChestOpen(true);
                setToast({ line: A.completeLine, es: A.completeEs, role: 'narrator' }); speak(A.completeLine, 'narrator');
                pendingRef.current = () => void complete();
                return;
            }
            if (talked.size < 2) { setToast({ line: 'Ask the villagers first to get clues.', es: 'Pregunta primero a los aldeanos para conseguir pistas.', role: 'narrator' }); speak('Ask the villagers first to get clues.', 'narrator'); return; }
            if (it.id === A.keyLocation) { playSfx('complete'); setKeyFound(true); setToast({ line: it.foundLine, es: it.foundEs, role: 'narrator' }); speak(it.foundLine, 'narrator'); }
            else { playSfx('wrong'); setToast({ line: it.wrongLine || 'Nothing here.', es: it.wrongEs, role: 'narrator' }); speak(it.wrongLine || 'Nothing here.', 'narrator'); }
        });
    }
    function closeToast() { const cb = pendingRef.current; pendingRef.current = null; stopAudio(); setToast(null); cb?.(); }

    async function complete() {
        if (!A) return;
        setStep('finishing');
        try {
            const r = await fetch('/api/adventures/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: A.id }) });
            const d = await r.json();
            setReward(r.ok ? { xp: d.xpEarned ?? 0, coins: d.coinsEarned ?? 0 } : { xp: 0, coins: 0 });
        } catch { setReward({ xp: 0, coins: 0 }); }
        setStep('complete');
    }

    return {
        step, setStep, pos, talked, keyFound, chestOpen, reward,
        npc, cstage, setCstage, reply, nudge, toast, moving,
        goTo, talkTo, pick, closeConvo, interact, closeToast, speak,
    };
}
