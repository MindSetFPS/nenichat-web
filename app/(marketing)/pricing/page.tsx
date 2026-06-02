import CtaSection from "@/components/marketing/landing/sections/cta-section"
import PricingSection from "@/components/marketing/landing/sections/pricing-section"

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <main className="flex-1">

                <PricingSection />

                {/* FAQ Section */}
                <section className="py-8 bg-muted/30">
                    <div className="container px-4 md:px-6 mx-auto max-w-3xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">Preguntas Frecuentes</h2>
                            <p className="text-muted-foreground">Resolvemos tus dudas antes de empezar.</p>
                        </div>
                        <div className="grid gap-6">
                            <div className="bg-background p-6 rounded-xl border">
                                <h3 className="font-bold text-lg mb-2">¿Qué incluye Neni Flow?</h3>
                                <p className="text-muted-foreground">Neni Flow incluye detección automatizada de pedidos, respuestas inteligentes a tus clientes y atención al cliente prioritaria, todo por una tarifa plana mensual. Sin límites de uso ni créditos.</p>
                            </div>
                            <div className="bg-background p-6 rounded-xl border">
                                <h3 className="font-bold text-lg mb-2">¿Hay algún límite de pedidos?</h3>
                                <p className="text-muted-foreground">No hay un límite fijo. Neni Flow está diseñado para el volumen normal de un negocio. Si tu negocio tiene un volumen excepcionalmente alto, nos pondremos en contacto contigo para ofrecerte un plan personalizado.</p>
                            </div>
                            <div className="bg-background p-6 rounded-xl border">
                                <h3 className="font-bold text-lg mb-2">¿Puedo cancelar la suscripción Empresaria?</h3>
                                <p className="text-muted-foreground">Sí, en cualquier momento. No hay plazos forzosos. Si cancelas, tu cuenta pasa al plan Neni Starter automáticamente.</p>
                            </div>
                        </div>
                    </div>
                </section>
                <CtaSection />
            </main>
        </div>
    )
}
