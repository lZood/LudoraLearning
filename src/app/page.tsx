import Hero from "@/components/Hero";
import LudoraCardsSection from "@/components/LudoraCardsSection";
import BlockyFinalSection from "@/components/BlockyFinalSection";
import MinecraftDiorama from "@/components/MinecraftDiorama";
import MethodologyStack from "@/components/MethodologyStack";
import PhotoGallery from "@/components/PhotoGallery";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f1e4] relative text-[#1a1a1a]">
      <Hero />
      <LudoraCardsSection />
      <BlockyFinalSection />
      <PhotoGallery />
      <MethodologyStack />
      <MinecraftDiorama />
      <Footer />
    </main>
  );
}
