import Hero from "@/components/Hero";
import MethodologyStack from "@/components/MethodologyStack";
import Footer from "@/components/Footer";

export default function MetodologiaPage() {
    return (
        <main className="min-h-screen bg-[#f5f1e4] relative text-[#1a1a1a]">
            <Hero
                title={<>NUESTRA <br className="hidden md:block" /> METODOLOGÍA</>}
                subtitle="Aprender sin darte cuenta. Sumérgete en entornos interactivos 100% en inglés diseñados para el aprendizaje natural."
                mediaSrc="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80"
                isVideo={false}
            />

            {/* Añadimos componentes de tu página original que tienen sentido aquí */}
            <div className="relative z-20 bg-[#f5f1e4]">
                <MethodologyStack />
            </div>

            <Footer />
        </main>
    );
}
