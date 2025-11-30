"use client"

import { Input } from "@/components/ui/input"
import { RainbowButton } from "@/components/ui/rainbow-button"

export function WaitlistForm() {
    return (
        <form className="flex flex-col sm:flex-row gap-2 h-12" onSubmit={(e) => e.preventDefault()}>
            <Input
                type="text"
                placeholder="Correo electrónico o número de teléfono"
                className="py-6 md:h-12 bg-background border-primary/20 w-full md:w-lg "
            />
            <RainbowButton variant={"default"} className="h-12 rounded-lg font-bold" size={"lg"} >
                <p className="block md:hidden">
                    Unirme a la lista de espera
                </p>
                <p className="hidden md:block">Pre-registrarme</p>
            </RainbowButton>
        </form>
    )
}
