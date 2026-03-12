import Hero from "@/components/Hero";
import HeroTransition from "@/components/HeroTransition";
import LandingIntro from "@/components/LandingIntro";
import LudoraCardsSection from "@/components/LudoraCardsSection";
import BlockyFinalSection from "@/components/BlockyFinalSection";
import MethodologyStack from "@/components/MethodologyStack";
import PhotoGallery from "@/components/PhotoGallery";
import Footer from "@/components/Footer";
import DiscordCTA from "@/components/comunidad/DiscordCTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f1e4] relative text-[#1a1a1a]">
      <Hero
        showGrid={false}
        layout={{
          titleStart: { mobile: 1, desktop: 1 },
          titleSpan: { mobile: 4, desktop: 13 },
          subtitleStart: { mobile: 1, desktop: 1 },
          subtitleSpan: { mobile: 4, desktop: 10 }
        }}
      />
      <HeroTransition showShadow={false} transitionColor="#88e04f" />
      <LandingIntro />
      <LudoraCardsSection />
      <BlockyFinalSection />
      <PhotoGallery />
      <MethodologyStack />
      <DiscordCTA />
      <Footer />
    </main>
  );
}
