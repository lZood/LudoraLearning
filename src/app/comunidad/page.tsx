import Hero from "@/components/Hero";
import HeroTransition from "@/components/HeroTransition";
import ClassroomWindow from "@/components/comunidad/ClassroomWindow";
import ProjectGallery from "@/components/comunidad/ProjectGallery";
import SkillTree from "@/components/comunidad/SkillTree";
import HeroStories from "@/components/comunidad/HeroStories";
import EventsCalendar from "@/components/comunidad/EventsCalendar";
import DiscordCTA from "@/components/comunidad/DiscordCTA";
import Footer from "@/components/Footer";

export default function ComunidadPage() {
    return (
        <main className="min-h-screen bg-[#f5f1e4] relative text-[#1a1a1a]">
            <Hero
                title={<>COMUNIDAD <br className="hidden md:block" /> LUDORA</>}
                subtitle="Descubre la transformación de nuestros alumnos. Aprende programación e inglés mientras construyes proyectos increíbles en Minecraft."
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
            {/* The first component is ClassroomWindow which has a #222222 background, so we transition to that color */}
            <HeroTransition showShadow={false} transitionColor="#222222" />

            <ClassroomWindow />
            <ProjectGallery />
            <SkillTree />
            <HeroStories />
            <EventsCalendar />
            <DiscordCTA />

            <Footer />
        </main>
    );
}
