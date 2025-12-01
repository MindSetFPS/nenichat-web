import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, MessageSquare, Users, BarChart, Star, Crown } from "lucide-react"
import { ShineBorder } from "@/components/ui/shine-border"
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
                                <h3 className="font-bold text-lg mb-2">¿Qué pasa si se me acaban los créditos del plan Recargas?</h3>
                                <p className="text-muted-foreground">El bot deja de contestar automáticamente, pero tú puedes seguir contestando manualmente. Puedes recargar en cualquier momento y se reactiva al instante.</p>
                            </div>
                            <div className="bg-background p-6 rounded-xl border">
                                <h3 className="font-bold text-lg mb-2">¿Qué es una "Conversación Efectiva"?</h3>
                                <p className="text-muted-foreground">Es cuando el bot logra concretar una venta. Si el bot habla con el cliente pero no se concreta la venta, solo te cuesta 0.3 créditos (Conversación No Efectiva).</p>
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
