'use client'

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import ContactAvatar from "@/components/contact-avatar"
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier"
import { getHiddenContactsAction } from "@/app/(app)/settings/actions"
import Link from "next/link"

/**
 * @function HiddenContactsSettings
 * @description Renders the list of hidden contacts.
 */
export function HiddenContactsSettings() {
    const [contacts, setContacts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchContacts() {
            try {
                const data = await getHiddenContactsAction()
                setContacts(data)
            } catch (err) {
                console.error('Error fetching hidden contacts:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchContacts()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold">Contactos Ocultos</h3>
                <p className="text-sm text-muted-foreground">
                    Gestiona los contactos que has ocultado de tu lista principal.
                </p>
            </div>

            {contacts.length === 0 ? (
                <div className="bg-muted/30 rounded-2xl p-8 text-center border border-dashed border-border">
                    <p className="text-muted-foreground text-sm">No tienes contactos ocultos.</p>
                </div>
            ) : (
                <div className="grid gap-2">
                    {contacts.map((contact) => (
                        <Link
                            key={contact.id}
                            href={`/chats/${contact.id}`}
                            className='flex items-center gap-4 p-3 rounded-2xl hover:bg-accent/50 transition-colors border border-transparent hover:border-border'
                        >
                            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                <ContactAvatar seed={getContactIdentifier(contact)!} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">
                                    {contact.contact_name || contact.pushname || contact.phone_number || contact.lid}
                                </p>
                                <p className="text-xs text-muted-foreground">Ver chat</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
