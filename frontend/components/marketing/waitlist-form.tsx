"use client"

import { Input } from "@/components/ui/input"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { addToWaitlist } from "@/app/actions/waitlist"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"

export function WaitlistForm() {
    const [state, action, isPending] = useActionState(addToWaitlist, null)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        if (state?.success) {
            setSubmitted(true)
            toast.success("¡Gracias por unirte!")
        } else if (state?.error) {
            toast.error(state.error)
        }
    }, [state])

    useEffect(() => {
        if (document.cookie.includes('waitlist_joined=true')) {
            setSubmitted(true)
        }
    }, [])

    return (
        <form action={action} className="flex flex-col sm:flex-row gap-2 h-12">
            <Input
                name="contact"
                type="text"
                placeholder="Correo electrónico o número de teléfono"
                className="py-6 md:h-12 bg-background border-primary/20 w-full md:w-lg "
                disabled={submitted || isPending}
                required
            />
            <RainbowButton
                variant={"default"}
                className="h-12 rounded-lg font-bold"
                size={"lg"}
                disabled={submitted || isPending}
            >
                {submitted ? (
                    "Gracias por unirte al pre-registro"
                ) : (
                    <>
                        <p className="block md:hidden">
                            Unirme a la lista de espera
                        </p>
                        <p className="hidden md:block">Pre-registrarme</p>
                    </>
                )}
            </RainbowButton>
        </form>
    )
}
