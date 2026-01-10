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
        <section className="py-20">
            <div className="container px-4 md:px-6 mx-auto text-center space-y-4">
                <h2 className="text-3xl font-bold">¿Lista para llevar tu negocio al siguiente nivel?</h2>
                <p className="text-md text-muted-foreground">
                    Unete a la lista de espera para obtener $999mxn en créditos y precio preferencial de por vida.
                </p>
                <RainbowButton
                    onClick={scrollToHero}
                    variant={"default"}
                    className="h-12 rounded-lg font-bold"
                    size={"lg"} >
                    Unirme a la lista de espera
                </RainbowButton>
            </div>
        </section>
    )
}