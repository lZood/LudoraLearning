import AboutHeroNew from "@/components/sobre-nosotros/AboutHeroNew";
import AboutInfoCards from "@/components/sobre-nosotros/AboutInfoCards";
import AboutTeamGrid from "@/components/sobre-nosotros/AboutTeamGrid";
import AboutFooterCTANew from "@/components/sobre-nosotros/AboutFooterCTANew";
import Footer from "@/components/Footer";

export default function SobreNosotrosPage() {
    return (
        <main className="min-h-screen relative text-[#1a1a1a] w-full" style={{ backgroundColor: '#f5f1e4' }}>
            <div className="w-full relative shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] rounded-b-[50px] z-20">
                <AboutHeroNew />
            </div>

            <div className="w-full relative z-10 -mt-10 pt-10">
                <AboutInfoCards />
            </div>

            <div className="-mt-10 relative z-20">
                <AboutTeamGrid />
            </div>

            <AboutFooterCTANew />

            <Footer />
        </main>
    );
}
