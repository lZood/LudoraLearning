import Hero from "@/components/Hero";
import HeroTransition from "@/components/HeroTransition";
import EstrategiaOrigin from "@/components/estrategia/EstrategiaOrigin";
import EstrategiaPlanning from "@/components/estrategia/EstrategiaPlanning";
import EstrategiaMinecraftSection from "@/components/estrategia/EstrategiaMinecraft";
import EstrategiaPronunciation from "@/components/estrategia/EstrategiaPronunciation";
import EstrategiaRealUsage from "@/components/estrategia/EstrategiaRealUsage";
import EstrategiaResults from "@/components/estrategia/EstrategiaResults";
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
                layout={{
                    titleStart: { mobile: 1, desktop: 1 },
                    titleSpan: { mobile: 3, desktop: 13 },
                    subtitleStart: { mobile: 1, desktop: 1 },
                    subtitleSpan: { mobile: 4, desktop: 11 }
                }}
                titleSize="clamp(2.8rem, 10.5cqw, 9rem)"
                showGrid={false}
            />
            <HeroTransition showShadow={false} transitionColor="#f0ecff" />
            <EstrategiaOrigin />
            <EstrategiaPlanning />
            <EstrategiaMinecraftSection />
            <EstrategiaPronunciation />
            <EstrategiaRealUsage />
            <EstrategiaResults />
            <EstrategiaWhyMinecraft />
            <Footer />
        </main>
    );
}
