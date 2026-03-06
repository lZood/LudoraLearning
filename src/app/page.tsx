import Hero from "@/components/Hero";
import HeroTransition from "@/components/HeroTransition";
import LudoraCardsSection from "@/components/LudoraCardsSection";
import BlockyFinalSection from "@/components/BlockyFinalSection";
import MinecraftDiorama from "@/components/MinecraftDiorama";
import MethodologyStack from "@/components/MethodologyStack";
import PhotoGallery from "@/components/PhotoGallery";
import Footer from "@/components/Footer";
import ParallaxImage from "@/components/ParallaxImage";

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
      <HeroTransition />
      <LudoraCardsSection />
      <BlockyFinalSection />
      <PhotoGallery />
      <MethodologyStack />
      <MinecraftDiorama />
      <Footer />
    </main>
  );
}
