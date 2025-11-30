import { PricingCard } from "../../pricing-card";

export default function PricingSection() {
    return (
        <section id="pricing" className="py-20 bg-muted/50">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">Simple, transparent pricing</h2>
                    <p className="text-muted-foreground text-lg">
                        Choose the plan that fits your business needs. No hidden fees.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <PricingCard
                        title="Neni Starter"
                        price="$0"
                        description="El Caballo de Troya. Adquisición Masiva."
                        features={["Catálogo Digital ilimitado", "Neni Link para Bio", "Generador de Pedidos", "Validación Transferencias (30/mes)"]}
                    />
                    <PricingCard
                        title="Recargas"
                        price="$5+"
                        description="Tu Vaca Lechera. Paga lo que usas."
                        features={["Desde $5 USD", "Sin rentas forzosas", "Saldo no vence", "Ideal para temporadas"]}
                        popular
                    />
                    <PricingCard
                        title="Empresaria"
                        price="$49"
                        description="The Infinity Tier. Para PYMEs."
                        features={["Conversaciones Ilimitadas", "Multi-Agente", "Exportación de Data", "Broadcasts/Difusión"]}
                    />
                </div>
            </div>
        </section>
    )
}