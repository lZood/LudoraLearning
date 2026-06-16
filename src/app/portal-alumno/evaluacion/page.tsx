'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronDown, ArrowRight, Sparkles, Plane, GraduationCap, Briefcase, Gamepad2, RotateCcw } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Mascot from '@/components/lesson/Mascot';
import DiagnosticPlayer from '@/components/evaluation/DiagnosticPlayer';

type Step = 'loading' | 'welcome' | 'objective' | 'placement' | 'diagnostic' | 'gate' | 'finishing' | 'result' | 'finalizeError';
type Result = { band: number; bandTitle: string; cefr: string; perSkill: Record<string, number> };
type Answer = { id: string; raw: unknown };
const PENDING_KEY = 'ludora_pending_placement';
const GOAL_KEY = 'ludora_goal';

const SELF: { label: string; sub: string; theta0: number }[] = [
    { label: 'Empiezo de cero', sub: 'Casi no sé inglés', theta0: 1.5 },
    { label: 'Sé algo', sub: 'Entiendo lo básico', theta0: 3.0 },
    { label: 'Ya me defiendo', sub: 'Puedo conversar un poco', theta0: 4.0 },
];
const GOALS = [
    { id: 'travel', label: 'Viajar', icon: Plane },
    { id: 'school', label: 'Escuela', icon: GraduationCap },
    { id: 'work', label: 'Trabajo', icon: Briefcase },
    { id: 'fun', label: 'Diversión', icon: Gamepad2 },
];
const SKILL_ES: Record<string, string> = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };
const frase = (band: number) =>
    band <= 2 ? 'Estás empezando tu aventura. ¡Vamos a construir tus primeras palabras!'
        : band <= 4 ? 'Ya dominas lo básico; tu próxima meta es comunicarte con más soltura.'
            : '¡Buen nivel! Ahora a pulir la fluidez y la conversación.';

export default function EvaluacionPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState<Step>('loading');
    const [theta0, setTheta0] = useState(2.0);
    const [authed, setAuthed] = useState(false);
    const [result, setResult] = useState<Result | null>(null);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const finalizingRef = useRef(false);                                  // guard anti doble-finalize
    const pendingRef = useRef<{ theta0: number; history: Answer[] } | null>(null); // para reintentar

    // Al cargar: si el invitado ya hizo la diagnóstica y ahora vuelve autenticado (tras registrarse),
    // se finaliza el placement pendiente guardado en localStorage. Si no hay nada pendiente, empieza el flujo.
    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setAuthed(!!user);
            let pending: { theta0: number; history: Answer[] } | null = null;
            try { const raw = localStorage.getItem(PENDING_KEY); if (raw) pending = JSON.parse(raw); } catch { /* noop */ }
            if (user && pending && Array.isArray(pending.history) && pending.history.length) {
                await finalize(pending.history, pending.theta0);
                return;
            }
            if (user) {
                // Autenticado sin pendiente: si ya está ubicado, al dashboard (no repetir la diagnóstica).
                const { data } = await supabase.from('users').select('has_completed_evaluation, english_level').eq('id', user.id).maybeSingle();
                if (data?.has_completed_evaluation || data?.english_level) { router.replace('/portal-alumno/dashboard'); return; }
            }
            setStep('welcome');
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function finalize(history: Answer[], t0: number) {
        if (finalizingRef.current) return; // evita doble disparo (StrictMode / re-render)
        finalizingRef.current = true;
        pendingRef.current = { theta0: t0, history };
        setStep('finishing');
        try {
            const r = await fetch('/api/placement/finalize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: history, theta0: t0 }) });
            const d = await r.json();
            if (r.ok) {
                try { localStorage.removeItem(PENDING_KEY); } catch { /* noop */ } // solo se borra tras ÉXITO
                setResult(d); setStep('result');
            } else { finalizingRef.current = false; setStep('finalizeError'); }
        } catch { finalizingRef.current = false; setStep('finalizeError'); }
    }

    const onFinish = async (history: Answer[]) => {
        if (!history.length) { setStep('welcome'); return; } // p.ej. fallo de red antes de responder nada
        // Guarda SIEMPRE el resultado por si el flujo se interrumpe (registro/confirmación de correo).
        try { localStorage.setItem(PENDING_KEY, JSON.stringify({ theta0, history })); } catch { /* noop */ }
        if (authed) { await finalize(history, theta0); return; }
        setStep('gate'); // invitado: se registra para guardar su nivel
    };

    // ---------- Pantallas ----------
    if (step === 'loading' || step === 'finishing') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-6">
                <Mascot character="apicultor" mood="happy" className={`w-24 h-24 ${step === 'finishing' ? 'animate-bounce' : ''}`} />
                {step === 'finishing' && <p className="text-xl font-black text-gray-900">¡Listo! Encontramos tu nivel…</p>}
                <Loader2 className="w-6 h-6 text-[#632EB0] animate-spin" />
            </div>
        );
    }

    if (step === 'welcome') {
        return (
            <Shell>
                <Mascot character="apicultor" mood="happy" className="w-32 h-32" />
                <div>
                    <h1 className="text-3xl font-black text-gray-900">¡Hola, aventurero!</h1>
                    <p className="text-gray-500 font-bold mt-2 max-w-sm">Vamos a jugar un poco para encontrar tu nivel perfecto. Sin exámenes aburridos, lo prometo.</p>
                </div>
                <Cta onClick={() => setStep('objective')}>Empezar <ArrowRight className="w-5 h-5" /></Cta>
                <p className="text-xs font-bold text-gray-400">Toma unos 3 minutos · No necesitas cuenta para empezar</p>
            </Shell>
        );
    }

    if (step === 'objective') {
        return (
            <Shell>
                <Sparkles className="w-10 h-10 text-[#632EB0]" />
                <div>
                    <h1 className="text-2xl font-black text-gray-900">¿Para qué quieres el inglés?</h1>
                    <p className="text-gray-500 font-bold text-sm mt-1">Así personalizamos tu aventura.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                    {GOALS.map((g) => {
                        const Icon = g.icon;
                        return (
                            <button key={g.id} onClick={() => { try { localStorage.setItem(GOAL_KEY, g.id); } catch { /* noop */ } setStep('placement'); }}
                                className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-gray-200 hover:border-[#632EB0] active:scale-[0.97] transition-all">
                                <Icon className="w-7 h-7 text-[#632EB0]" />
                                <span className="font-black text-gray-800">{g.label}</span>
                            </button>
                        );
                    })}
                </div>
                <button onClick={() => setStep('placement')} className="text-xs font-bold text-gray-400 underline">Prefiero no decir</button>
            </Shell>
        );
    }

    if (step === 'placement') {
        return (
            <Shell>
                <Mascot character="apicultor" mood="curious" className="w-24 h-24" />
                <div>
                    <h1 className="text-2xl font-black text-gray-900">¿Cuánto inglés sabes?</h1>
                    <p className="text-gray-500 font-bold text-sm mt-1">Empezamos en el punto justo (puedes equivocarte, es solo el inicio).</p>
                </div>
                <div className="w-full max-w-sm flex flex-col gap-3">
                    {SELF.map((s) => (
                        <button key={s.label} onClick={() => { setTheta0(s.theta0); setStep('diagnostic'); }}
                            className="w-full text-left p-4 rounded-2xl border-2 border-gray-200 hover:border-[#632EB0] active:scale-[0.98] transition-all">
                            <p className="font-black text-gray-900">{s.label}</p>
                            <p className="text-xs font-bold text-gray-400">{s.sub}</p>
                        </button>
                    ))}
                </div>
            </Shell>
        );
    }

    if (step === 'finalizeError') {
        return (
            <Shell>
                <Mascot character="apicultor" mood="sad" className="w-24 h-24" />
                <div>
                    <h1 className="text-xl font-black text-gray-900">No pudimos guardar tu nivel</h1>
                    <p className="text-gray-500 font-bold text-sm mt-1 max-w-xs">Tu progreso está a salvo. Intentémoslo de nuevo.</p>
                </div>
                <Cta onClick={() => { const p = pendingRef.current; if (p) void finalize(p.history, p.theta0); }}>
                    <RotateCcw className="w-5 h-5" /> Reintentar
                </Cta>
            </Shell>
        );
    }

    if (step === 'diagnostic') return <DiagnosticPlayer theta0={theta0} onFinish={onFinish} />;

    if (step === 'gate') {
        return (
            <Shell>
                <Mascot character="apicultor" mood="happy" className="w-28 h-28 animate-bounce" />
                <div>
                    <h1 className="text-2xl font-black text-gray-900">¡Terminaste! 🎉</h1>
                    <p className="text-gray-500 font-bold mt-2 max-w-sm">Crea tu cuenta para guardar tu nivel y empezar tu ruta. Tardas 30 segundos.</p>
                </div>
                <Cta onClick={() => router.push('/portal-alumno?mode=register&redirectedFrom=/portal-alumno/evaluacion')}>
                    Crear mi cuenta <ArrowRight className="w-5 h-5" />
                </Cta>
                <button onClick={() => router.push('/portal-alumno?redirectedFrom=/portal-alumno/evaluacion')} className="text-sm font-bold text-gray-400 underline">
                    Ya tengo cuenta
                </button>
            </Shell>
        );
    }

    // result (mínimo)
    const r = result!;
    return (
        <Shell>
            <Mascot character="apicultor" mood="happy" className="w-32 h-32" />
            <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Tu nivel</p>
                <h1 className="text-3xl font-black text-[#632EB0]">Nivel {r.band}</h1>
                <p className="text-lg font-black text-gray-900">{r.bandTitle}</p>
            </div>
            <p className="text-gray-600 font-medium max-w-sm">{frase(r.band)}</p>
            <Cta onClick={() => router.replace('/portal-alumno/dashboard')}>Empezar mi ruta</Cta>
            <button onClick={() => setShowBreakdown((v) => !v)} className="text-xs font-bold text-gray-400 inline-flex items-center gap-1">
                Ver mi desglose <ChevronDown className={`w-3 h-3 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
            </button>
            {showBreakdown && (
                <div className="w-full max-w-sm flex flex-col gap-2">
                    {Object.entries(r.perSkill).map(([s, pct]) => (
                        <div key={s} className="flex items-center gap-3">
                            <span className="w-20 text-left text-xs font-black text-gray-500">{SKILL_ES[s] || s}</span>
                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#632EB0] rounded-full" style={{ width: `${pct}%` }} /></div>
                            <span className="text-xs font-bold text-gray-400 w-8">{pct}%</span>
                        </div>
                    ))}
                </div>
            )}
        </Shell>
    );
}

function Shell({ children }: { children: React.ReactNode }) {
    return <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center gap-6">{children}</div>;
}
function Cta({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
    return (
        <button onClick={onClick} className="inline-flex items-center justify-center gap-2 bg-[#88e04f] text-[#1a1a1a] font-black px-10 py-4 rounded-2xl shadow-[0_4px_0_#6dc536] active:scale-95 active:shadow-[0_1px_0_#6dc536] transition-all">
            {children}
        </button>
    );
}
