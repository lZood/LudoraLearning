import AboutHeroNew from "@/components/sobre-nosotros/AboutHeroNew";
import AboutInfoCards from "@/components/sobre-nosotros/AboutInfoCards";
import AboutTeamGrid from "@/components/sobre-nosotros/AboutTeamGrid";
import AboutFooterCTANew from "@/components/sobre-nosotros/AboutFooterCTANew";
import Footer from "@/components/Footer";

export default function SobreNosotrosPage() {
    return (
        <main className="min-h-screen relative w-full bg-[#f5f1e4]">
            {/* Hero — cinematic with team photo */}
            <AboutHeroNew />

            {/* Manifesto + Timeline */}
            <AboutInfoCards />

            {/* Team mosaic */}
            <AboutTeamGrid />

            {/* Narrative closing CTA */}
            <AboutFooterCTANew />

            <Footer />
        </main>
    );
}
