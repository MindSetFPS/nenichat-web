import { RainbowButton } from "@/components/ui/rainbow-button";
import { FaqItem } from "../../faq-item";


import type { SVGProps } from "react";
import { Button } from "@/components/ui/button";

const WhatsApp = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 360 362">
        <path
            fill="#25D366"
            fillRule="evenodd"
            d="M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z"
            clipRule="evenodd"
        />
    </svg>
);

export { WhatsApp };



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
                        question="¿Necesito el WhatsApp Business API?"
                        answer="Sí, Nenichat se conecta directamente a la API oficial de WhatsApp Business para garantizar la confiabilidad y la cumplimiento. Te ayudamos a través del proceso de verificación."
                    />
                    <FaqItem
                        question="¿Puedo usar mi número de WhatsApp existente?"
                        answer="¡Por supuesto! Puedes migrar tu número de negocio actual a nuestra plataforma sin perder tu identidad."
                    />
                    <FaqItem
                        question="¿El bot realmente maneja las ventas?"
                        answer="Nuestro bot está entrenado para manejar consultas de productos, recomendar artículos basados en tu catálogo y guiar a los clientes al checkout. Para problemas complejos, se lo envía suavemente a un agente humano."
                    />
                    <FaqItem
                        question="¿Hay una tarifa de configuración?"
                        answer="No. Creemos en ganar tu negocio. Solo pagas la tarifa mensual de suscripción."
                    />
                </div>
                <div className="flex flex-col items-center py-16">
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">¿Más preguntas?</h1>
                    <RainbowButton className="mx-auto" variant={"outline"}>
                        <a href="https://wa.me/5219999999999" target="_blank">
                            <WhatsApp className="inline h-4 w-4 mr-2" />Envíanos un mensaje</a></RainbowButton>
                </div>
            </div>


        </section>
    )
}