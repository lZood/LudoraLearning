"use client";

import React, { useState } from 'react';
import { Volume2, Info } from 'lucide-react';

// Vocabulary Mapping (Minecraft Theme)
const vowels = [
    { symbol: "ɑ", example: "B l o c k", image: "https://minecraft-api.com/api/items/grass_block", highlight: "o" },
    { symbol: "æ", example: "A p p l e", image: "https://minecraft-api.com/api/items/apple", highlight: "A" },
    { symbol: "ʌ", example: "S u n", image: "https://minecraft-api.com/api/items/sunflower", highlight: "u" },
    { symbol: "ɛ", example: "B e d", image: "https://minecraft-api.com/api/items/red_bed", highlight: "e" },
    { symbol: "eɪ", example: "C a v e", image: "https://minecraft-api.com/api/items/stone", highlight: "a" },
    { symbol: "ɚ", example: "D i r t", image: "https://minecraft-api.com/api/items/dirt", highlight: "i r" },
    { symbol: "ɪ", example: "P i g", image: "https://minecraft-api.com/api/items/porkchop", highlight: "i" }, // Fallback to porkchop as entity images need different API
    { symbol: "i", example: "S h e e p", image: "https://minecraft-api.com/api/items/white_wool", highlight: "e e" },
    { symbol: "ə", example: "A r m o r", image: "https://minecraft-api.com/api/items/iron_chestplate", highlight: "A" },
    { symbol: "oʊ", example: "B o a t", image: "https://minecraft-api.com/api/items/oak_boat", highlight: "o a" },
    { symbol: "ʊ", example: "W o o d", image: "https://minecraft-api.com/api/items/oak_log", highlight: "o o" },
    { symbol: "u", example: "M o o n", image: "https://minecraft-api.com/api/items/ender_pearl", highlight: "o o" }, // Represents moon/end
    { symbol: "aʊ", example: "C o w", image: "https://minecraft-api.com/api/items/beef", highlight: "o w" },
    { symbol: "aɪ", example: "S l i m e", image: "https://minecraft-api.com/api/items/slime_ball", highlight: "i" },
    { symbol: "ɔɪ", example: "V o i d", image: "https://minecraft-api.com/api/items/end_portal_frame", highlight: "o i" },
];

const consonants = [
    { symbol: "b", example: "B o w", image: "https://minecraft-api.com/api/items/bow", highlight: "B" },
    { symbol: "ʧ", example: "C h e s t", image: "https://minecraft-api.com/api/items/chest", highlight: "C h" },
    { symbol: "d", example: "D i r t", image: "https://minecraft-api.com/api/items/dirt", highlight: "D" },
    { symbol: "f", example: "F i s h", image: "https://minecraft-api.com/api/items/cod", highlight: "F" },
    { symbol: "g", example: "G o l d", image: "https://minecraft-api.com/api/items/gold_ingot", highlight: "G" },
    { symbol: "h", example: "H o e", image: "https://minecraft-api.com/api/items/iron_hoe", highlight: "H" },
    { symbol: "ʤ", example: "J u n g l e", image: "https://minecraft-api.com/api/items/jungle_sapling", highlight: "J" },
    { symbol: "k", example: "C r a f t", image: "https://minecraft-api.com/api/items/crafting_table", highlight: "C" },
    { symbol: "l", example: "L a v a", image: "https://minecraft-api.com/api/items/lava_bucket", highlight: "L" },
    { symbol: "m", example: "M e l o n", image: "https://minecraft-api.com/api/items/melon", highlight: "M" },
    { symbol: "n", example: "N e t h e r", image: "https://minecraft-api.com/api/items/netherrack", highlight: "N" },
    { symbol: "ŋ", example: "S t r i n g", image: "https://minecraft-api.com/api/items/string", highlight: "n g" },
    { symbol: "p", example: "P i c k a x e", image: "https://minecraft-api.com/api/items/iron_pickaxe", highlight: "P" },
    { symbol: "ɹ", example: "R e d s t o n e", image: "https://minecraft-api.com/api/items/redstone", highlight: "R" },
    { symbol: "s", example: "S w o r d", image: "https://minecraft-api.com/api/items/iron_sword", highlight: "S" },
    { symbol: "ʒ", example: "T r e a s u r e", image: "https://minecraft-api.com/api/items/gold_block", highlight: "s u" },
    { symbol: "ʃ", example: "S h i e l d", image: "https://minecraft-api.com/api/items/shield", highlight: "S h" },
    { symbol: "t", example: "T o r c h", image: "https://minecraft-api.com/api/items/torch", highlight: "T" },
    { symbol: "ð", example: "L e a t h e r", image: "https://minecraft-api.com/api/items/leather", highlight: "t h" },
    { symbol: "θ", example: "P a t h", image: "https://minecraft-api.com/api/items/dirt_path", highlight: "t h" },
    { symbol: "v", example: "V i l l a g e", image: "https://minecraft-api.com/api/items/bell", highlight: "V" }, // Bell for village
    { symbol: "w", example: "W a t e r", image: "https://minecraft-api.com/api/items/water_bucket", highlight: "W" },
    { symbol: "j", example: "Y e l l o w", image: "https://minecraft-api.com/api/items/yellow_dye", highlight: "Y" },
    { symbol: "z", example: "Z o m b i e", image: "https://minecraft-api.com/api/items/rotten_flesh", highlight: "Z" },
];

export default function LetrasPage() {
    const [activePhoneme, setActivePhoneme] = useState<string | null>(null);

    const playSound = (symbol: string) => {
        // In a real app, this would play the audio file for the phoneme
        setActivePhoneme(symbol);
        setTimeout(() => setActivePhoneme(null), 1000);
    };

    const renderCard = (item: any, type: 'vowel' | 'consonant') => {
        const isHovered = activePhoneme === item.symbol;
        const colorClass = type === 'vowel' ? 'text-blue-600' : 'text-[#632EB0]';
        const bgHoverClass = type === 'vowel' ? 'hover:border-blue-400 hover:shadow-blue-100' : 'hover:border-[#632EB0] hover:shadow-purple-100';

        // Helper to format the highlighted text
        const exampleText = item.example.split('').map((char: string, index: number) => {
            if (char === ' ') return <span key={index}>&nbsp;</span>;
            const cleanHighlight = item.highlight.replace(/ /g, '');
            const isHighlighted = cleanHighlight.includes(char);
            return (
                <span key={index} className={`${isHighlighted ? colorClass + ' font-black' : 'text-gray-500'}`}>
                    {char}
                </span>
            );
        });

        return (
            <button
                key={item.symbol}
                onClick={() => playSound(item.symbol)}
                className={`relative bg-white rounded-2xl p-4 border-2 border-gray-100 flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-lg ${bgHoverClass} ${isHovered ? 'scale-105' : ''}`}
            >
                {/* Sonido / IPA */}
                <div className="text-3xl font-serif text-gray-900 absolute top-3 left-4 opacity-30">
                    /{item.symbol}/
                </div>

                {/* Minecraft Image */}
                <div className="w-16 h-16 flex items-center justify-center mt-6">
                    {/* Fallback box if image fails or loading, normally Next.js Image component is better but using img for external api */}
                    <img
                        src={item.image}
                        alt={item.example.replace(/ /g, '')}
                        className="w-12 h-12 object-contain filter drop-shadow hover:scale-125 transition-transform [image-rendering:pixelated]"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://minecraft-api.com/api/items/grass_block'; }}
                    />
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

            {/* Vocales (Vowels) */}
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

            <div className="w-full h-px bg-gray-200 my-4" />

            {/* Consonantes (Consonants) */}
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

        </div>
    );
}
