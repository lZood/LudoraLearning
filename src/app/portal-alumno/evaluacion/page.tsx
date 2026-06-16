'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronDown } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Mascot from '@/components/lesson/Mascot';
import DiagnosticPlayer from '@/components/evaluation/DiagnosticPlayer';

type Step = 'placement' | 'diagnostic' | 'finishing' | 'result';
type Result = { band: number; bandTitle: string; cefr: string; perSkill: Record<string, number> };
type Answer = { id: string; raw: unknown };

const SELF: { label: string; sub: string; theta0: number }[] = [
    { label: 'Empiezo de cero', sub: 'Casi no sé inglés', theta0: 1.5 },
    { label: 'Sé algo', sub: 'Entiendo lo básico', theta0: 3.0 },
    { label: 'Ya me defiendo', sub: 'Puedo conversar un poco', theta0: 4.0 },
];
const SKILL_ES: Record<string, string> = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };
const frase = (band: number) =>
    band <= 2 ? 'Estás empezando tu aventura. ¡Vamos a construir tus primeras palabras!'
        : band <= 4 ? 'Ya dominas lo básico; tu próxima meta es comunicarte con más soltura.'
            : '¡Buen nivel! Ahora a pulir la fluidez y la conversación.';

export default function EvaluacionPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState<Step>('placement');
    const [theta0, setTheta0] = useState(2.0);
    const [result, setResult] = useState<Result | null>(null);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.replace('/portal-alumno'); return; }
            setChecking(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onFinish = async (history: Answer[]) => {
        setStep('finishing');
        try {
            const r = await fetch('/api/placement/finalize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: history, theta0 }) });
            const d = await r.json();
            if (r.ok) { setResult(d); setStep('result'); }
            else { router.replace('/portal-alumno/dashboard'); }
        } catch { router.replace('/portal-alumno/dashboard'); }
    };

    if (checking) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#632EB0] animate-spin" /></div>;

    if (step === 'placement') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center gap-6">
                <Mascot character="apicultor" mood="happy" className="w-28 h-28" />
                <div>
                    <h1 className="text-2xl font-black text-gray-900">¿Cuánto inglés sabes?</h1>
                    <p className="text-gray-500 font-bold text-sm mt-1">Así empezamos en el punto justo (puedes equivocarte, es solo el inicio).</p>
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
            </div>
        );
    }

    if (step === 'diagnostic') return <DiagnosticPlayer theta0={theta0} onFinish={onFinish} />;

    if (step === 'finishing') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-6">
                <Mascot character="apicultor" mood="happy" className="w-28 h-28 animate-bounce" />
                <p className="text-xl font-black text-gray-900">¡Listo! Encontramos tu nivel…</p>
                <Loader2 className="w-6 h-6 text-[#632EB0] animate-spin" />
            </div>
        );
    }

    // result (mínimo)
    const r = result!;
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center gap-6">
            <Mascot character="apicultor" mood="happy" className="w-32 h-32" />
            <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Tu nivel</p>
                <h1 className="text-3xl font-black text-[#632EB0]">Banda {r.band}</h1>
                <p className="text-lg font-black text-gray-900">{r.bandTitle}</p>
            </div>
            <p className="text-gray-600 font-medium max-w-sm">{frase(r.band)}</p>
            <button onClick={() => router.replace('/portal-alumno/dashboard')} className="bg-[#88e04f] text-[#1a1a1a] font-black px-10 py-4 rounded-2xl shadow-[0_4px_0_#6dc536] active:scale-95">
                Empezar mi ruta
            </button>
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
                    <p className="text-[11px] text-gray-400 mt-1">CEFR aproximado: {r.cefr}</p>
                </div>
            )}
        </div>
    );
}
