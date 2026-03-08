"use client";

import React from 'react';
import { Edit2, Flame, Zap, Shield, Medal } from 'lucide-react';

export default function PerfilPage() {
    return (
        <div className="flex flex-col gap-8 pb-20 max-w-2xl mx-auto w-full animate-in fade-in duration-500">

            {/* Header Banner con personaje */}
            <div className="relative w-full h-48 sm:h-56 bg-[#78C8F2] rounded-3xl flex justify-center mt-8 mb-16 shadow-inner border border-blue-200">

                {/* Botón de Editar */}
                <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2.5 rounded-xl border border-white/40 shadow-sm backdrop-blur-sm transition-all text-white hover:scale-105 active:scale-95">
                    <Edit2 className="w-5 h-5 text-gray-800" />
                </button>

                {/* Avatar de Minecraft */}
                <div className="absolute -bottom-16">
                    <img
                        src="https://minotar.net/armor/bust/Steve/150.png"
                        alt="Avatar de Minecraft"
                        className="w-32 h-32 md:w-[150px] md:h-[150px] drop-shadow-xl hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </div>

            {/* Información del Usuario */}
            <div className="flex justify-between items-start border-b-2 border-gray-100 pb-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-gray-900">Steve</h1>
                    <p className="text-gray-400 font-medium text-sm">Steve_Crafter</p>
                    <p className="text-gray-500 text-sm mt-1">Se unió en Octubre 2025</p>
                    <div className="flex items-center gap-6 mt-4">
                        <button className="text-[#1CB0F6] font-bold text-[15px] hover:text-blue-500 transition-colors uppercase tracking-wide">3 Siguiendo</button>
                        <button className="text-[#1CB0F6] font-bold text-[15px] hover:text-blue-500 transition-colors uppercase tracking-wide">1 Seguidor</button>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-200 transition-colors">
                        <span className="text-xl">🇺🇸</span>
                    </div>
                </div>
            </div>

            {/* Sección de Estadísticas */}
            <div className="flex flex-col gap-5">
                <h2 className="text-2xl font-bold text-gray-900">Estadísticas</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Racha */}
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-5 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
                        <Flame className="w-8 h-8 text-[#FF9600]" fill="currentColor" />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-900">7</span>
                            <span className="text-gray-500 text-sm font-semibold">Racha de días</span>
                        </div>
                    </div>

                    {/* XP Total */}
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-5 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
                        <Zap className="w-8 h-8 text-[#FFC800]" fill="currentColor" />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-900">320</span>
                            <span className="text-gray-500 text-sm font-semibold">XP Total</span>
                        </div>
                    </div>

                    {/* Liga */}
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-5 relative overflow-hidden hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
                        <div className="absolute top-3 right-3 bg-gray-300 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider">
                            Semana 1
                        </div>
                        <Shield className="w-8 h-8 text-[#89A1B9]" fill="currentColor" />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-900">Plata</span>
                            <span className="text-gray-500 text-sm font-semibold">Liga actual</span>
                        </div>
                    </div>

                    {/* Top 3 */}
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-5 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
                        <Medal className="w-8 h-8 text-[#A5AFB8]" fill="currentColor" />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-900">0</span>
                            <span className="text-gray-500 text-sm font-semibold">Veces en el top 3</span>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
