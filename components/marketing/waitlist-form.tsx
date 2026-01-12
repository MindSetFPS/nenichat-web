"use client"

import { Input } from "@/components/ui/input"
import { useState } from "react"
import { WhatsAppButton } from "./whatsapp-button"

export function WaitlistForm({ phoneNumber }: { phoneNumber: string }) {
    const [contact, setContact] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 h-12">
            <Input
                name="contact"
                type="text"
                placeholder="Tu nombre"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="py-6 md:h-12 bg-background border-primary/20 w-full md:w-lg "
                required
            />
            <WhatsAppButton
                phone={phoneNumber!}
                message={`Hola, me interesa unirme a la lista de espera de NeniChat, me llamo ${contact}`}
                label="Apartar mi lugar"
                showIcon={true}
                variant="default"
                className="h-12 rounded-lg font-bold"
                size="lg"
            />
        </form>
    )
}

