"use client"

import { RainbowButton } from "@/components/ui/rainbow-button";

export default function CtaSection() {
    const scrollToHero = () => {
        const hero = document.getElementById("hero");
        if (hero) {
            hero.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className="py-64">
            <div className="container px-4 md:px-6 mx-auto text-center space-y-4">
                <h2 className="text-3xl font-bold">Tu yo del futuro te agradecerá este click.</h2>
                <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
                    Deja de vivir pegada al celular contestando lo mismo a cada cliente. Automatiza tu negocio hoy y empieza con $999 MXN de regalo por ser fundadora.                </p>
                <RainbowButton
                    onClick={scrollToHero}
                    variant={"default"}
                    className="h-12 rounded-lg font-bold"
                    size={"lg"} >
                    Apartar mi lugar hoy
                </RainbowButton>
                <p className="text-xs text-muted-foreground mt-4">
                    ⚡ Cupos limitados para el acceso anticipado.
                </p>
            </div>
        </section>
    )
}