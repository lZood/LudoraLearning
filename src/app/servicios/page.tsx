import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export default function ServiciosPage() {
    return (
        <main className="min-h-screen bg-[#f5f1e4] relative text-[#1a1a1a]">
            <Hero
                title={<>NUESTROS <br className="hidden md:block" /> SERVICIOS</>}
                subtitle="Descubre todo lo que Ludora Learning tiene preparado para llevar tu nivel de inglés al máximo jugando."
                mediaSrc="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1920&q=80"
                isVideo={false}
            />

            {/* Contenido temporal de relleno para que se note el "scroll" del Hero */}
            <div className="relative bg-[#f5f1e4] z-20 py-24 px-6 sm:px-12 md:px-24 mx-auto max-w-7xl min-h-[50vh]">
                <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Lo que ofrecemos</h2>
                <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl leading-relaxed">
                    Esta es la página de servicios. Aquí puedes añadir más adelante las tarjetas de tus planes, clases especializadas o cualquier otro detalle comercial para tus estudiantes.
                </p>
            </div>

            <Footer />
        </main>
    );
}
