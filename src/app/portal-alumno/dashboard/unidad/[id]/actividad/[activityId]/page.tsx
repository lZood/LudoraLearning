'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Volume2, Send, Check, X, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { ActivityContent, QuizQuestion } from '@/lib/activityContent';

export default function ActivityPlayerPage() {
    const params = useParams();
    const router = useRouter();
    const unitExt = params.id as string;
    const activityId = params.activityId as string;
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [missing, setMissing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [unitId, setUnitId] = useState<string>('');
    const [xp, setXp] = useState(10);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState<ActivityContent | null>(null);
    const [done, setDone] = useState(false);
    const [saving, setSaving] = useState(false);
    const alreadyCompletedRef = useRef(false); // si ya estaba completada, no se vuelve a otorgar XP

    // Corta el TTS del navegador al salir de la actividad (evita que siga hablando en otra pantalla).
    useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch { /* noop */ } }, []);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id ?? null);
            const { data: act } = await supabase
                .from('activities')
                .select('id, type, title, xp_reward, content, unit_id, unit:units!activities_unit_id_fkey(external_id)')
                .eq('id', activityId)
                .maybeSingle();
            const unit = (Array.isArray(act?.unit) ? act?.unit[0] : act?.unit) as { external_id?: string } | undefined;
            if (!act || !act.content || unit?.external_id !== unitExt) { setMissing(true); setLoading(false); return; }
            setUnitId(act.unit_id as string);
            setXp((act.xp_reward as number) ?? 10);
            setTitle(act.title as string);
            setContent(act.content as ActivityContent);
            if (user) {
                const { data: prog } = await supabase.from('user_activity_progress').select('completed_at').eq('user_id', user.id).eq('activity_id', activityId).maybeSingle();
                alreadyCompletedRef.current = !!prog?.completed_at;
            }
            setLoading(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activityId]);

    const completeActivity = async () => {
        if (!userId || !unitId || saving) { setDone(true); return; }
        setSaving(true);
        try {
            await supabase.from('user_activity_progress').upsert(
                { user_id: userId, activity_id: activityId, completed_at: new Date().toISOString(), attempts: 1 },
                { onConflict: 'user_id,activity_id' }
            );
            // El XP lo otorga el servidor de forma autoritativa (deriva xp_reward de la BD y paga
            // una sola vez por actividad). El cliente ya NO puede conceder XP por su cuenta.
            await fetch('/api/lessons/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activityId }) }).catch(() => {});
            const { data: acts } = await supabase.from('activities').select('id').eq('unit_id', unitId);
            const ids = (acts ?? []).map((a) => a.id as string);
            const total = ids.length || 1;
            const { data: doneRows } = await supabase
                .from('user_activity_progress')
                .select('activity_id')
                .eq('user_id', userId)
                .in('activity_id', ids)
                .not('completed_at', 'is', null);
            const pct = Math.round(((doneRows?.length ?? 0) / total) * 100);
            await supabase.from('user_progress').upsert(
                { user_id: userId, unit_id: unitId, progress_pct: pct, status: pct >= 100 ? 'completed' : 'in_progress', last_accessed_at: new Date().toISOString() },
                { onConflict: 'user_id,unit_id' }
            );
        } catch (e) { console.error('complete activity:', e); }
        setSaving(false);
        setDone(true);
    };

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#632EB0] animate-spin" /></div>;
    if (missing) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-xl font-black text-gray-900">Actividad no disponible</p>
            <Link href={`/portal-alumno/dashboard/unidad/${unitExt}`} className="bg-[#632EB0] text-white font-bold px-6 py-3 rounded-2xl">Volver a la unidad</Link>
        </div>
    );

    if (!content) return null;

    return (
        <div className="min-h-screen bg-white">
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <Link href={`/portal-alumno/dashboard/unidad/${unitExt}`} className="p-1 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-6 h-6" /></Link>
                <h1 className="text-sm font-black truncate">{title}</h1>
                <span className="ml-auto text-[11px] font-black text-[#632EB0] bg-purple-50 px-3 py-1 rounded-full">+{xp} XP</span>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
                {done ? (
                    <CompletedView xp={xp} onBack={() => router.push(`/portal-alumno/dashboard/unidad/${unitExt}`)} saving={saving} />
                ) : content.kind === 'theory' ? (
                    <TheoryView slides={content.slides} onComplete={completeActivity} />
                ) : content.kind === 'audio' ? (
                    <AudioView tts={content.tts} questions={content.questions} onComplete={completeActivity} />
                ) : content.kind === 'chat' ? (
                    <ChatView scenario={content.scenario} objective={content.objective} starter={content.starter} minTurns={content.minTurns ?? 3} onComplete={completeActivity} />
                ) : (
                    <QuizView intro={content.intro} questions={content.questions} onComplete={completeActivity} />
                )}
            </div>
        </div>
    );
}

function CompletedView({ xp, onBack, saving }: { xp: number; onBack: () => void; saving: boolean }) {
    return (
        <div className="flex flex-col items-center text-center gap-5 py-16">
            <div className="w-24 h-24 rounded-full bg-[#88e04f]/15 flex items-center justify-center"><Trophy className="w-12 h-12 text-[#88e04f]" /></div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">¡Actividad completada!</h2>
            <p className="text-gray-500 font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-500" /> Ganaste +{xp} XP</p>
            <button onClick={onBack} disabled={saving} className="mt-4 bg-[#632EB0] hover:bg-[#522594] text-white font-black px-8 py-3.5 rounded-2xl disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Continuar
            </button>
        </div>
    );
}

function TheoryView({ slides, onComplete }: { slides: { title: string; body: string; imageUrl?: string; phrases?: string[] }[]; onComplete: () => void }) {
    const [i, setI] = useState(0);
    const s = slides[i];
    const last = i === slides.length - 1;
    return (
        <div className="flex flex-col gap-6">
            <div className="flex gap-1.5">{slides.map((_, idx) => <div key={idx} className={`h-1.5 flex-1 rounded-full ${idx <= i ? 'bg-[#632EB0]' : 'bg-gray-100'}`} />)}</div>
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 min-h-[300px]">
                <h2 className="text-2xl font-black text-gray-900 mb-4">{s.title}</h2>
                {s.imageUrl && <img src={s.imageUrl} alt="" className="w-full rounded-2xl mb-4" />}
                <p className="text-gray-700 leading-relaxed font-medium mb-5">{s.body}</p>
                {s.phrases && (
                    <div className="space-y-2">
                        {s.phrases.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-purple-50/50 border border-purple-100 rounded-2xl px-4 py-3 font-bold text-gray-800">
                                <Volume2 className="w-4 h-4 text-[#632EB0] shrink-0 cursor-pointer" onClick={() => speak(p.split('—')[0])} />
                                {p}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex justify-between">
                <button onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0} className="px-5 py-3 rounded-2xl bg-gray-100 font-bold text-gray-600 disabled:opacity-40">Atrás</button>
                {last
                    ? <button onClick={onComplete} className="px-8 py-3 rounded-2xl bg-[#88e04f] text-[#1a1a1a] font-black flex items-center gap-2">Completar <Check className="w-4 h-4" /></button>
                    : <button onClick={() => setI((v) => v + 1)} className="px-8 py-3 rounded-2xl bg-[#632EB0] text-white font-black flex items-center gap-2">Siguiente <ChevronRight className="w-4 h-4" /></button>}
            </div>
        </div>
    );
}

function QuizView({ intro, questions, onComplete }: { intro?: string; questions: QuizQuestion[]; onComplete: () => void }) {
    const [i, setI] = useState(0);
    const [sel, setSel] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const q = questions[i];
    const answered = sel !== null;
    const last = i === questions.length - 1;

    const choose = (idx: number) => { if (answered) return; setSel(idx); if (idx === q.correct) setScore((s) => s + 1); };
    const next = () => { if (last) { onComplete(); return; } setI((v) => v + 1); setSel(null); };

    return (
        <div className="flex flex-col gap-6">
            {intro && i === 0 && <p className="text-center text-gray-500 font-bold">{intro}</p>}
            <div className="flex gap-1.5">{questions.map((_, idx) => <div key={idx} className={`h-1.5 flex-1 rounded-full ${idx <= i ? 'bg-[#632EB0]' : 'bg-gray-100'}`} />)}</div>
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Pregunta {i + 1}/{questions.length}</p>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6">{q.prompt}</h2>
                <div className="space-y-3">
                    {q.options.map((opt, idx) => {
                        const isCorrect = idx === q.correct;
                        const state = !answered ? 'idle' : isCorrect ? 'correct' : idx === sel ? 'wrong' : 'idle';
                        return (
                            <button key={idx} onClick={() => choose(idx)} disabled={answered}
                                className={`w-full text-left p-4 rounded-2xl border-2 font-bold flex items-center gap-3 transition-all ${
                                    state === 'correct' ? 'border-[#88e04f] bg-[#88e04f]/10 text-gray-900'
                                    : state === 'wrong' ? 'border-red-400 bg-red-50 text-gray-900'
                                    : 'border-gray-100 hover:border-[#632EB0] text-gray-800'}`}>
                                <span className="flex-1">{opt}</span>
                                {state === 'correct' && <Check className="w-5 h-5 text-[#88e04f]" />}
                                {state === 'wrong' && <X className="w-5 h-5 text-red-500" />}
                            </button>
                        );
                    })}
                </div>
                {answered && q.explanation && <p className="mt-4 text-sm font-medium text-gray-500 bg-gray-50 rounded-2xl p-3">{q.explanation}</p>}
            </div>
            {answered && (
                <button onClick={next} className="px-8 py-4 rounded-2xl bg-[#632EB0] text-white font-black flex items-center justify-center gap-2">
                    {last ? `Terminar (${score}/${questions.length})` : 'Siguiente'} <ChevronRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

function AudioView({ tts, questions, onComplete }: { tts: string; questions: QuizQuestion[]; onComplete: () => void }) {
    const [started, setStarted] = useState(false);
    return (
        <div className="flex flex-col gap-6">
            <div className="bg-purple-50/50 border border-purple-100 rounded-3xl p-8 text-center">
                <p className="text-[10px] font-black text-[#632EB0] uppercase tracking-widest mb-4">Escucha con atención</p>
                <button onClick={() => { speak(tts); setStarted(true); }} className="inline-flex items-center gap-3 bg-[#632EB0] hover:bg-[#522594] text-white font-black px-8 py-4 rounded-2xl active:scale-95">
                    <Volume2 className="w-6 h-6" /> Reproducir audio
                </button>
                <p className="text-xs text-gray-400 font-bold mt-3">Puedes repetirlo las veces que quieras.</p>
            </div>
            {started
                ? <QuizView questions={questions} onComplete={onComplete} />
                : <p className="text-center text-gray-400 font-bold">Pulsa "Reproducir audio" para empezar.</p>}
        </div>
    );
}

function ChatView({ scenario, objective, starter, minTurns, onComplete }: { scenario: string; objective: string; starter: string; minTurns: number; onComplete: () => void }) {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'npc'; text: string }>>([{ role: 'npc', text: starter }]);
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const userTurns = messages.filter((m) => m.role === 'user').length;
    const canFinish = userTurns >= minTurns;
    const endRef = useRef<HTMLDivElement>(null);
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = async () => {
        const text = input.trim();
        if (!text || busy) return;
        const next = [...messages, { role: 'user' as const, text }];
        setMessages(next);
        setInput('');
        setBusy(true);
        try {
            const res = await fetch('/api/lesson-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario, objective, messages: next }) });
            const data = await res.json();
            setMessages((m) => [...m, { role: 'npc', text: res.ok ? data.reply : 'Sorry, try again.' }]);
        } catch { setMessages((m) => [...m, { role: 'npc', text: 'Sorry, try again.' }]); }
        setBusy(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm">
                <p className="font-black text-amber-800">Tu misión</p>
                <p className="text-amber-700 font-medium">{objective}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-4 flex flex-col gap-3 min-h-[340px]">
                {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl font-medium text-sm flex items-start gap-2 ${m.role === 'user' ? 'bg-[#632EB0] text-white' : 'bg-gray-100 text-gray-800'}`}>
                            {m.role === 'npc' && <Volume2 className="w-4 h-4 mt-0.5 shrink-0 cursor-pointer text-[#632EB0]" onClick={() => speak(m.text)} />}
                            <span>{m.text}</span>
                        </div>
                    </div>
                ))}
                {busy && <div className="flex justify-start"><div className="bg-gray-100 px-4 py-2.5 rounded-2xl"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div></div>}
                <div ref={endRef} />
            </div>
            <div className="flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()}
                    placeholder="Escribe en inglés…" className="flex-1 border-2 border-gray-100 focus:border-[#632EB0] rounded-2xl px-4 py-3 outline-none" />
                <button onClick={send} disabled={busy} className="bg-[#632EB0] text-white px-5 rounded-2xl disabled:opacity-50"><Send className="w-5 h-5" /></button>
            </div>
            <button onClick={onComplete} disabled={!canFinish}
                className="px-8 py-4 rounded-2xl bg-[#88e04f] text-[#1a1a1a] font-black disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {canFinish ? <>Terminar práctica <Check className="w-4 h-4" /></> : `Escribe ${minTurns - userTurns} mensaje(s) más`}
            </button>
        </div>
    );
}

function speak(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text.trim());
        u.lang = 'en-US';
        u.rate = 0.95;
        const v = window.speechSynthesis.getVoices().find((vo) => vo.lang.startsWith('en'));
        if (v) u.voice = v;
        window.speechSynthesis.speak(u);
    } catch { /* noop */ }
}
