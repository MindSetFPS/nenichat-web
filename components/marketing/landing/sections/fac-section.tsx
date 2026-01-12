import { WhatsAppButton } from "../../whatsapp-button";
import { FaqItem } from "../../faq-item";

// get env variable for phone number
const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER;

if (!phoneNumber) {
    throw new Error("NEXT_PUBLIC_PHONE_NUMBER is not defined");
}

export default function FaqSection() {
    return (
        <section id="faq" className="py-24 bg-background">
            <div className="container px-4 md:px-6 mx-auto max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">Preguntas Frecuentes</h2>
                    <p className="text-muted-foreground text-lg">
                        Todo lo que necesitas saber sobre Nenichat.
                    </p>
                </div>
                <div className="space-y-4">
                    <FaqItem
                        question="¿Puedo usar mi número de WhatsApp existente?"
                        answer="¡Por supuesto! Puedes migrar tu número de negocio actual a nuestra plataforma."
                    />
                    <FaqItem
                        question="¿El bot realmente maneja las ventas?"
                        answer="Nuestro bot está entrenado para manejar consultas de productos, recomendar artículos basados en tu catálogo y guiar a los clientes al checkout. Para problemas complejos, se lo envía suavemente a un agente humano."
                    />

                </div>
                <div className="flex flex-col items-center py-16">
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">¿Más preguntas?</h1>
                    <WhatsAppButton
                        showIcon={true}
                        message="Hola, tengo una pregunta sobre NeniChat"
                        phone={phoneNumber!}
                        variant="outline"
                        className="mx-auto"
                    />
                </div>
            </div>
        </section>
    )
}