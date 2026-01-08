"use client"

import { Input } from "@/components/ui/input"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function WaitlistForm() {
    const [submitted, setSubmitted] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [contact, setContact] = useState("")

    useEffect(() => {
        if (document.cookie.includes('waitlist_joined=true')) {
            setSubmitted(true)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)

        if (!contact) {
            toast.error('Por favor ingresa un correo o teléfono.')
            setIsPending(false)
            return
        }

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/

        const isEmail = emailRegex.test(contact)
        const isPhone = phoneRegex.test(contact)

        if (!isEmail && !isPhone) {
            toast.error('Por favor ingresa un correo electrónico o número de teléfono válido.')
            setIsPending(false)
            return
        }

        try {
            // Check cookie again just in case
            if (document.cookie.includes('waitlist_joined=true')) {
                setSubmitted(true)
                toast.success("¡Ya estás en la lista!")
                setIsPending(false)
                return
            }

            // Insert into DB using Supabase
            const { error } = await supabase
                .from('preregister')
                .insert({ contact: contact })

            if (error) {
                console.error('Supabase error:', error)
                throw new Error(error.message)
            }

            // Set cookie
            document.cookie = "waitlist_joined=true; max-age=" + (60 * 60 * 24 * 365) + "; path=/"

            setSubmitted(true)
            toast.success("¡Gracias por unirte!")
        } catch (error: any) {
            console.error('Waitlist error:', error)
            toast.error('Hubo un error al unirte a la lista. Por favor, inténtalo más tarde.')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 h-12">
            <Input
                name="contact"
                type="text"
                placeholder="Correo electrónico o número de teléfono"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="py-6 md:h-12 bg-background border-primary/20 w-full md:w-lg "
                disabled={submitted || isPending}
                required
            />
            <RainbowButton
                type="submit"
                variant={"default"}
                className="h-12 rounded-lg font-bold"
                size={"lg"}
                disabled={submitted || isPending}
            >
                {submitted ? (
                    "Gracias por unirte al pre-registro"
                ) : (
                    <>
                        <span className="block md:hidden">
                            Unirme a la lista de espera
                        </span>
                        <span className="hidden md:block">Pre-registrarme</span>
                    </>
                )}
            </RainbowButton>
        </form>
    )
}

