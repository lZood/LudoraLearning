import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export default function ComunidadPage() {
    return (
        <main className="min-h-screen bg-[#f5f1e4] relative text-[#1a1a1a]">
            <Hero
                title={<>COMUNIDAD <br className="hidden md:block" /> Y SOPORTE</>}
                subtitle="Forma parte de una red de estudiantes apasionados. Juega, aprende, resuelve dudas y comparte tus logros."
                mediaSrc="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80"
                isVideo={false}
                layout={{
                    titleStart: { mobile: 1, desktop: 1 },
                    titleSpan: { mobile: 4, desktop: 12 },
                    subtitleStart: { mobile: 1, desktop: 1 },
                    subtitleSpan: { mobile: 4, desktop: 10 }
                }}
                showGrid={true}
            />

            <div className="relative bg-[#f5f1e4] z-20 py-24 px-6 sm:px-12 md:px-24 mx-auto max-w-7xl min-h-[50vh]">
                <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Nuestra Tribu</h2>
                <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl leading-relaxed">
                    Esta página está dedicada a nuestra comunidad de jugadores y estudiantes. Aquí podrán encontrar enlaces a Discord, foros o rankings de estudiantes.
                </p>
            </div>

            <Footer />
        </main>
    );
}
