import Hero from "@/components/Hero";
import HeroTransition from "@/components/HeroTransition";
import MissionStatement from "@/components/MissionStatement";
import TeamSection from "@/components/TeamSection";
import OurValues from "@/components/OurValues";
import AboutProcess from "@/components/AboutProcess";
import AboutDifference from "@/components/AboutDifference";
import AboutCTA from "@/components/AboutCTA";
import Footer from "@/components/Footer";
import FloatingNavMenu from "@/components/FloatingNavMenu";

export default function SobreNosotrosPage() {
    return (
        <main className="min-h-screen bg-[#f5f1e4] relative text-[#1a1a1a] pb-24">
            <Hero
                title={<>DETRÁS DE<br className="hidden md:block" /> LUDORA</>}
                subtitle="Conoce al equipo que convierte cada partida de Minecraft en una clase de inglés inolvidable."
                mediaSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80"
                isVideo={false}
                layout={{
                    titleStart: { mobile: 1, desktop: 1 },
                    titleSpan: { mobile: 4, desktop: 12 },
                    subtitleStart: { mobile: 1, desktop: 1 },
                    subtitleSpan: { mobile: 4, desktop: 10 },
                }}
                showGrid={false}
            />
            <HeroTransition />

            <div id="nosotros">
                <MissionStatement />
            </div>

            <div id="por-que">
                <OurValues />
            </div>

            <div id="proceso">
                <AboutProcess />
            </div>

            <div id="diferencia">
                <AboutDifference />
            </div>

            <div id="equipo">
                <TeamSection />
            </div>

            <AboutCTA />

            <FloatingNavMenu />

            <Footer />
        </main>
    );
}
