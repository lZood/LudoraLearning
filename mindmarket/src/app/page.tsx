import Hero from "@/components/Hero";
import ScrollSnake from "@/components/ScrollSnake";
import LudoraCard from "@/components/LudoraCard";
import BlockyFinalSection from "@/components/BlockyFinalSection";
import MinecraftDiorama from "@/components/MinecraftDiorama";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f1e4] relative">
      <ScrollSnake />
      <Hero />

      {/* Section 2 continuation. The sticky animation from Hero ends with a full #f5f1e4 screen,
          so this section naturally flows directly below it, making the transition seamless. */}
      {/* We add z-10 here so the content sits above the ScrollSnake background */}
      <section className="bg-transparent w-full pt-24 pb-48 px-4 sm:px-6 relative z-10 pointer-events-none">
        <div className="max-w-[85vw] mx-auto pointer-events-auto flex flex-col space-y-[100vh]">

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

      <BlockyFinalSection />
      <MinecraftDiorama />
    </main>
  );
}
