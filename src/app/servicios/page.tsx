import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ServicesList from "@/components/ServicesList";
import ParallaxImage from "@/components/ParallaxImage";
import HeroTransition from "@/components/HeroTransition";

export default function ServiciosPage() {
    return (
        <main className="min-h-screen bg-[#f5f1e4] relative text-[#1a1a1a]">
            <Hero
                title={<>NUESTROS <br className="hidden md:block" /> SERVICIOS</>}
                subtitle="Descubre todo lo que Ludora Learning tiene preparado para llevar tu nivel de inglés al máximo jugando."
                mediaSrc="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1920&q=80"
                isVideo={false}
                layout={{
                    titleStart: { mobile: 1, desktop: 1 },
                    titleSpan: { mobile: 4, desktop: 12 },
                    subtitleStart: { mobile: 1, desktop: 1 },
                    subtitleSpan: { mobile: 4, desktop: 10 }
                }}
                showGrid={false}
            />
            <HeroTransition showShadow={false} />


            <Footer />
        </main>
    );
}
