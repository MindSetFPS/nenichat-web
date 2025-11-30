import { Button } from "@/components/ui/button";

export default function CtaSection() {
    return (
        <section className="py-20">
            <div className="container px-4 md:px-6 mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">¿Lista para llevar tu negocio al siguiente nivel?</h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="px-8">Crear Cuenta Gratis</Button>
                    <Button size="lg" variant="outline" className="px-8">Hablar con Ventas</Button>
                </div>
            </div>
        </section>
    )
}