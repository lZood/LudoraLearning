import Hero from "@/components/Hero";
import HeroTransition from "@/components/HeroTransition";
import EstrategiaOrigin from "@/components/EstrategiaOrigin";
import EstrategiaPlanning from "@/components/EstrategiaPlanning";
import EstrategiaMinecraftSection from "@/components/EstrategiaMinecraft";
import EstrategiaRealUsage from "@/components/EstrategiaRealUsage";
import EstrategiaResults from "@/components/EstrategiaResults";
import EstrategiaWhyMinecraft from "@/components/EstrategiaWhyMinecraft";
import Footer from "@/components/Footer";

export default function Estrategia() {
    return (
        <main className="min-h-screen bg-[#f5f1e4] relative text-[#1a1a1a]">
            <Hero
                title={<>ESTRATEGIA <br className="hidden md:block" /> PEDAGÓGICA</>}
                subtitle="Aprender sin darte cuenta. Sumérgete en entornos interactivos 100% en inglés diseñados para el aprendizaje natural."
                backgroundColor="#632eaf"
                titleColor="#ffffff"
                subtitleColor="#ffffff"
                showTextShadow={false}
                showOverlay={false}
                layout={{
                    titleStart: { mobile: 1, desktop: 1 },
                    titleSpan: { mobile: 4, desktop: 13 },
                    subtitleStart: { mobile: 1, desktop: 1 },
                    subtitleSpan: { mobile: 4, desktop: 11 }
                }}
                showGrid={false}
            />
            <HeroTransition showShadow={false} transitionColor="#f0ecff" />
            <EstrategiaOrigin />
            <EstrategiaPlanning />
            <EstrategiaMinecraftSection />
            <EstrategiaRealUsage />
            <EstrategiaResults />
            <EstrategiaWhyMinecraft />
            <Footer />
        </main>
    );
}
