"use client";

import React, { useState, useEffect } from 'react';
import { Volume2, Info, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type Phoneme = {
    id: string;
    ipa_symbol: string;
    type: 'vowel' | 'consonant';
    example_word: string | null;
    image_url: string | null;
    audio_url: string | null;
    order_index: number;
};

export default function LetrasPage() {
    const [activePhoneme, setActivePhoneme] = useState<string | null>(null);
    const [vowels, setVowels] = useState<Phoneme[]>([]);
    const [consonants, setConsonants] = useState<Phoneme[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        let cancelled = false;

        const fetchPhonemes = async () => {
            const { data, error } = await supabase
                .from('phonemes')
                .select('*')
                .order('order_index');

            if (cancelled) return;

            if (error || !data) {
                setVowels([]);
                setConsonants([]);
            } else {
                const rows = data as Phoneme[];
                setVowels(rows.filter(p => p.type === 'vowel'));
                setConsonants(rows.filter(p => p.type === 'consonant'));
            }
            setLoading(false);
        };

        fetchPhonemes();

        return () => { cancelled = true; };
    }, []);

    const playSound = (item: Phoneme) => {
        setActivePhoneme(item.id);
        // Si existe audio_url, reproduce el sonido; si no, no-op silencioso.
        if (item.audio_url) {
            try {
                new Audio(item.audio_url).play().catch(() => { /* silencioso */ });
            } catch {
                /* silencioso */
            }
        }
        setTimeout(() => setActivePhoneme(null), 1000);
    };

    const renderCard = (item: Phoneme, type: 'vowel' | 'consonant') => {
        const isHovered = activePhoneme === item.id;
        const colorClass = type === 'vowel' ? 'text-blue-600' : 'text-[#632EB0]';
        const bgHoverClass = type === 'vowel' ? 'hover:border-blue-400 hover:shadow-blue-100' : 'hover:border-[#632EB0] hover:shadow-purple-100';

        const word = item.example_word ?? '';
        // Espacia las letras para mantener el tracking visual original.
        const exampleText = word.split('').map((char: string, index: number) => (
            <span key={index} className={`${colorClass} font-black`}>
                {char}
            </span>
        ));

        return (
            <button
                key={item.id}
                onClick={() => playSound(item)}
                className={`relative bg-white rounded-2xl p-4 border-2 border-gray-100 flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-lg ${bgHoverClass} ${isHovered ? 'scale-105' : ''}`}
            >
                {/* Sonido / IPA */}
                <div className="text-3xl font-serif text-gray-900 absolute top-3 left-4 opacity-30">
                    {item.ipa_symbol}
                </div>

                {/* Imagen del ejemplo */}
                <div className="w-16 h-16 flex items-center justify-center mt-6">
                    {item.image_url ? (
                        <img
                            src={item.image_url}
                            alt={word}
                            className="w-12 h-12 object-contain filter drop-shadow hover:scale-125 transition-transform [image-rendering:pixelated]"
                        />
                    ) : (
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
                            <span className="text-xl font-serif text-gray-300">{item.ipa_symbol}</span>
                        </div>
                    )}
                </div>

                {/* Example Word */}
                <div className="text-lg font-bold tracking-widest mt-2">{exampleText}</div>

                {/* Play Icon Hint */}
                <div className="absolute bottom-2 right-2 text-gray-300">
                    <Volume2 className="w-4 h-4" />
                </div>
            </button>
        );
    };

    return (
        <div className="flex flex-col gap-10 pb-20 w-full max-w-6xl mx-auto animate-in fade-in duration-500">

            {/* Header Amigable */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-[2rem] p-8 md:p-10 border-2 border-gray-100 shadow-sm gap-6">
                <div className="flex-1">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Tabla Fonética <span className="text-[#632EB0]">Minecraft</span></h1>
                    <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
                        Aprende la pronunciación correcta de los sonidos en inglés (IPA) utilizando ejemplos interactivos basados en el universo de Minecraft.
                    </p>
                </div>
                <div className="hidden md:flex flex-col items-center bg-blue-50 text-blue-800 p-4 rounded-2xl border border-blue-100 max-w-xs">
                    <Info className="w-6 h-6 mb-2" />
                    <p className="text-sm text-center font-medium">Haz clic en cada bloque para escuchar la pronunciación del sonido resaltado.</p>
                </div>
            </div>

            {/* Estado de carga */}
            {loading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-24 text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin text-[#632EB0]" />
                    <p className="text-sm font-medium">Cargando sonidos...</p>
                </div>
            ) : vowels.length === 0 && consonants.length === 0 ? (
                /* Estado vacío amigable */
                <div className="flex flex-col items-center justify-center gap-4 py-24 bg-white rounded-[2rem] border-2 border-gray-100 shadow-sm text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center">
                        <Volume2 className="w-8 h-8 text-[#632EB0]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Aún no hay sonidos disponibles</h3>
                    <p className="text-gray-500 max-w-md">
                        La tabla fonética se está preparando. Vuelve más tarde para explorar la pronunciación de los sonidos en inglés.
                    </p>
                </div>
            ) : (
                <>
                    {/* Vocales (Vowels) */}
                    {vowels.length > 0 && (
                        <section className="flex flex-col gap-6">
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    Vocales <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{vowels.length} sonidos</span>
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Sonidos abiertos sin obstrucción del aire.</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {vowels.map(v => renderCard(v, 'vowel'))}
                            </div>
                        </section>
                    )}

                    {vowels.length > 0 && consonants.length > 0 && (
                        <div className="w-full h-px bg-gray-200 my-4" />
                    )}

                    {/* Consonantes (Consonants) */}
                    {consonants.length > 0 && (
                        <section className="flex flex-col gap-6">
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    Consonantes <span className="text-sm font-semibold text-[#632EB0] bg-[#632EB015] px-3 py-1 rounded-full">{consonants.length} sonidos</span>
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Sonidos donde el aire encuentra algún tipo de obstáculo.</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {consonants.map(c => renderCard(c, 'consonant'))}
                            </div>
                        </section>
                    )}
                </>
            )}

        </div>
    );
}
