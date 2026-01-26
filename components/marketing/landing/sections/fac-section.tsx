import { WhatsAppButton } from "../../whatsapp-button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

// get env variable for phone number
const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER;

if (!phoneNumber) {
    throw new Error("NEXT_PUBLIC_PHONE_NUMBER is not defined");
}

export default function FaqSection() {
    return (
        <section id="faq" className="pt-24 bg-background">
            <div className="container px-4 md:px-6 mx-auto max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">Preguntas Frecuentes</h2>
                </div>
                <div className="space-y-4">
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <span className="text-lg font-semibold">¿Puedo usar mi número de WhatsApp existente?</span>
                            </AccordionTrigger>
                            <AccordionContent>
                                <span className="text-md">
                                    ¡Por supuesto! Puedes usar tu número de negocio actual con Nenichat.
                                </span>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <span className="text-lg font-semibold">¿Cual es la diferencia entre Nenichat y Neni Flow?</span>
                            </AccordionTrigger>
                            <AccordionContent>
                                <span className="text-md">
                                    Nenichat es la interfaz de usuario que añade características de ecommerce a tus chats y es totalmente gratuito. Neni Flow te permite automatizar totalmente tus ventas.
                                </span>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <span className="text-lg font-semibold">¿Neni Flow realmente maneja las ventas?</span>
                            </AccordionTrigger>
                            <AccordionContent>
                                <span className="text-md">
                                    Neni Flow está entrenado para manejar consultas de productos, recomendar artículos basados en tu catálogo y guiar a los clientes al checkout. Para problemas complejos, se lo envía suavemente a un agente humano.
                                </span>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
                <div className="flex flex-col items-center pt-24">
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