import Hero from "@/components/Hero";
import HeroTransition from "@/components/HeroTransition";
import MethodologyStack from "@/components/MethodologyStack";
import Footer from "@/components/Footer";
import ServicesList from "@/components/ServicesList";
import ParallaxImage from "@/components/ParallaxImage";
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
            <HeroTransition showShadow={false} />

            {/* Añadimos componentes de tu página original que tienen sentido aquí */}
            <ServicesList />

            <div className="w-full">
                <ParallaxImage
                    src="https://images.unsplash.com/photo-1560523160-754a9e25c68f?auto=format&fit=crop&w=1920&q=80"
                    alt="Servicios Ludora Learning"
                    height="h-[100vh]"
                />
            </div>

            <div className="relative z-20 bg-[#f5f1e4]">
                <MethodologyStack />
            </div>

            <Footer />
        </main>
    );
}
