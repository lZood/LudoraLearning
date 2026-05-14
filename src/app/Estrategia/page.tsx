import Hero from "@/components/Hero";
import HeroTransition from "@/components/HeroTransition";
import EstrategiaBlackboard from "@/components/estrategia/EstrategiaBlackboard";
import EstrategiaWhyMinecraft from "@/components/estrategia/EstrategiaWhyMinecraft";
import Footer from "@/components/Footer";

export default function Estrategia() {
    return (
        <main className="min-h-screen bg-[#f5f1e4] relative text-[#1a1a1a]">
            <Hero
                title={<>ESTRATEGIA <br className="hidden md:block" /> PEDAGÓGICA</>}
                subtitle="Aprender sin darte cuenta. Sumérgete en entornos interactivos 100% en inglés diseñados para el aprendizaje natural."
                mediaSrc="/images/estrategia-page/school.webp"
                isVideo={false}
                showTextShadow={false}
                showOverlay={false}
            />
            <HeroTransition showShadow={false} transitionColor="#f0ecff" />
            <EstrategiaBlackboard />
            <EstrategiaWhyMinecraft />
            <Footer />
        </main>
    );
}
