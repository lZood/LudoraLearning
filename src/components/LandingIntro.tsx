import React from "react";
import { Sparkles, Gamepad2, GraduationCap } from "lucide-react";

export default function LandingIntro() {
    return (
        <section className="w-full bg-[#88e04f] py-16 px-4 sm:px-6 relative z-10 flex flex-col items-center justify-center text-center">
            <div className="max-w-4xl mx-auto">

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 text-[#1a1a1a] tracking-tight leading-tight">
                    El primer instituto de inglés <br className="hidden md:block" />
                    <span className="text-[#88e04f]">dentro de Minecraft</span>
                </h2>

                <p className="text-xl md:text-2xl text-[#1a1a1a]/80 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
                    Olvídate de las clases aburridas. En Ludora Learning combinamos una metodología comprobada con la inmersión total del gaming. Domina el inglés de forma natural mientras exploras, construyes y colaboras.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-black/5">
                        <div className="w-12 h-12 rounded-2xl bg-[#ff705d]/10 flex items-center justify-center text-[#ff705d] flex-shrink-0">
                            <Gamepad2 className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-[#1a1a1a]">Totalmente Inmersivo</h3>
                            <p className="text-sm text-[#1a1a1a]/70">Entornos diseñados para cada lección.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-black/5">
                        <div className="w-12 h-12 rounded-2xl bg-[#ebc1ff]/20 flex items-center justify-center text-[#9b51e0] flex-shrink-0">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-[#1a1a1a]">Acreditado</h3>
                            <p className="text-sm text-[#1a1a1a]/70">Metodología adaptada a estándares internacionales.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
