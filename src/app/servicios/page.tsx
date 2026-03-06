import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import HeroTransition from "@/components/HeroTransition";
import StudentInventory from "../../components/StudentInventory";
import ServicePricing from "../../components/ServicePricing";

export default function ServiciosPage() {
    return (
        <main className="min-h-screen bg-[#f5f1e4] relative text-[#1a1a1a]">
            <Hero
                title={<>NUESTRO <br className="hidden md:block" /> SERVICIO</>}
                subtitle="Descubre todo lo que Ludora Learning tiene preparado para llevar tu nivel de inglés al máximo jugando."
                mediaSrc="/images/service-page/windmill.webp"
                isVideo={false}
                layout={{
                    titleStart: { mobile: 1, desktop: 1 },
                    titleSpan: { mobile: 4, desktop: 12 },
                    subtitleStart: { mobile: 1, desktop: 1 },
                    subtitleSpan: { mobile: 4, desktop: 10 }
                }}
                showGrid={false}
            />
            <HeroTransition showShadow={false} transitionColor="#86d2fb" />
            {/* Nueva sección de Información de Inventario */}
            <StudentInventory />

            {/* Nueva sección de Pricing */}
            <ServicePricing />

            <Footer />
        </main>
    );
}
