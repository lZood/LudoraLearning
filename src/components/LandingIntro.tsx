import React from "react";

export default function LandingIntro() {
    return (
        <section className="w-full bg-[#88e04f] pt-16 pb-6 px-4 sm:px-6 relative z-10 flex flex-col items-center justify-center text-center">
            <div className="max-w-4xl mx-auto">

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-[#1a1a1a] tracking-tight leading-tight">
                    DONDE EL INGLES SE VIVE<br className="hidden md:block" />
                    <span className="text-[#88e04f]">no se memoriza</span>
                </h2>

                <p className="text-base md:text-lg text-[#1a1a1a]/80 mb-4 max-w-2xl mx-auto font-medium leading-relaxed">
                    Deja de intentar memorizar las reglas y comienza a usarlas. Desarrolla tu confianza al hablar mientras juegas, exploras y te comunicas dentro de Minecraft.
                </p>
            </div>
        </section>
    );
}
