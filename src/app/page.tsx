import Hero from "@/components/Hero";
import HeroTransition from "@/components/HeroTransition";
import LudoraCardsSection from "@/components/LudoraCardsSection";
import ExpandableCards from "@/components/ExpandableCards";
import BlockyMethodologyStack from "@/components/BlockyMethodologyStack";
import Footer from "@/components/Footer";
import DiscordCTA from "@/components/comunidad/DiscordCTA";
import PhotoGallery from "@/components/PhotoGallery";

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
      <HeroTransition showShadow={false} transitionColor="#f5f1e4" />
      <ExpandableCards />
      {/* <LudoraCardsSection /> */}
      <BlockyMethodologyStack />
      <PhotoGallery />
      <DiscordCTA />
      <Footer />
    </main>
  );
}
