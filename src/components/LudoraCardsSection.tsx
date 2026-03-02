"use client";

import React, { useRef } from "react";
import LudoraCard from "./LudoraCard";
import ScrollSnake from "./ScrollSnake";

export default function LudoraCardsSection() {
    const sectionRef = useRef<HTMLElement>(null);

    return (
        <section
            ref={sectionRef}
            className="bg-transparent w-full pt-24 pb-48 px-4 sm:px-6 relative pointer-events-none"
        >
            {/* El ScrollSnake ahora está confinado a esta sección y usa su scroll */}
            <div className="absolute inset-0 z-0">
                <ScrollSnake containerRef={sectionRef} />
            </div>

            <div className="max-w-[85vw] mx-auto pointer-events-auto flex flex-col space-y-[100vh] relative z-10">
                <LudoraCard
                    title="Sobrevive y comunica."
                    body="Aprende las frases esenciales para colaborar en servidores internacionales mientras construyes tu refugio."
                    buttonText="Ver metodología"
                    buttonHref="/metodologia"
                    secondaryColor="#ff705d"
                    position="justify-end"
                />

                <LudoraCard
                    title="Craftea tu gramática."
                    body="Entiende las estructuras del idioma mientras fabricas herramientas y exploras biomas únicos."
                    buttonText="Explorar cursos"
                    buttonHref="/cursos"
                    secondaryColor="#f5e211"
                    position="justify-start"
                />

                <LudoraCard
                    title="Comunidad global."
                    body="Únete a nuestro servidor educativo y practica inglés real con jugadores de todo el mundo en tiempo real."
                    buttonText="Unirse ahora"
                    buttonHref="/unirse"
                    secondaryColor="#2ba0ff"
                    position="justify-center"
                />

                <LudoraCard
                    title="Lógica redstone en inglés."
                    body="Domina conceptos técnicos complejos de ingeniería y automatización mientras expandes tu vocabulario."
                    buttonText="Cursos avanzados"
                    buttonHref="/avanzados"
                    secondaryColor="#ebc1ff"
                    position="justify-end"
                />
            </div>
        </section>
    );
}
