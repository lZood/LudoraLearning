import Hero from "@/components/Hero";
import HeroTransition from "@/components/HeroTransition";
import CommunityMasonryGallery from "@/components/comunidad/CommunityMasonryGallery";
import StudentTestimonials from "@/components/comunidad/StudentTestimonials";
import DiscordCTA from "@/components/comunidad/DiscordCTA";
import Footer from "@/components/Footer";

export default function ComunidadPage() {
    return (
        <main className="min-h-screen bg-[#f5f1e4] relative text-[#1a1a1a]">
            <Hero
                title={<>COMUNIDAD <br className="hidden md:block" /> LUDORA</>}
                subtitle="Forma parte de una red de estudiantes apasionados. Juega, aprende, resuelve dudas y comparte tus logros con nuestra tribu."
                titleColor="#ffffffff"
                subtitleColor="#ffffffff"
                mediaSrc="/images/comunidad/comunidad.webp"
                isVideo={false}
                showTextShadow={false}
                showOverlay={false}
                layout={{
                    titleStart: { mobile: 1, desktop: 1 },
                    titleSpan: { mobile: 4, desktop: 12 },
                    subtitleStart: { mobile: 1, desktop: 1 },
                    subtitleSpan: { mobile: 4, desktop: 10 }
                }}
                showGrid={false}
            />
            <HeroTransition showShadow={false} transitionColor="#e7e3d7" />
            <CommunityMasonryGallery />
            <StudentTestimonials />
            <DiscordCTA />
            <Footer />
        </main>
    );
}
