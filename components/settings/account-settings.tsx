'use client'

import { useState, useEffect } from "react"
import { User as UserIcon, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { IContact } from "@nenichat/domain/Contacts/domain/IContact"
import { ContactSelectorCombobox } from "@/components/contact-selector-combobox"
import { ProfileOverview } from "@/components/profile/profile-overview"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"
import { useBusiness } from "@/components/providers/business-context"

import { useUserStore } from "@/stores/user-store"

/**
 * @function AccountSettings
 * @description Renders the consolidated account and profile settings view.
 */
export function AccountSettings() {
    const { user, supabaseUser, isLoading, fetchUser } = useUserStore()
    const business = useBusiness()
    const supabase = createBrowserSupabaseClient()
    const router = useRouter()

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    if (isLoading) {
        return <Spinner className="h-5 w-5" />
    }

    if (!user && !supabaseUser) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                <UserIcon className="size-8 text-muted-foreground" />
                <div className="space-y-1">
                    <h3 className="font-semibold">Perfil no encontrado</h3>
                    <p className="max-w-xs text-sm text-muted-foreground">
                        No pudimos encontrar los datos de tu perfil. Por favor selecciona un contacto para vincularlo a tu cuenta.
                    </p>
                </div>
                <div className="mt-2 w-full max-w-sm">
                    <ProfileSelector onUserSelected={() => window.location.reload()} />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ProfileOverview
                user={user}
                supabaseUser={supabaseUser}
                businessName={business?.name}
                action={user ? <EditProfileDialog user={user} /> : undefined}
            />

            <div className="border-t pt-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                    <LogOut className="size-4" />
                    Cerrar sesión
                </Button>
            </div>
        </div>
    )
}

function ProfileSelector({ onUserSelected }: { onUserSelected: () => void }) {
    const [contacts, setContacts] = useState<IContact[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    useEffect(() => {
        const fetchContacts = async () => {
            setLoading(true)
            try {
                let url = '/api/contacts/search'
                if (debouncedSearchTerm && debouncedSearchTerm.length > 2) {
                    url += `?query=${debouncedSearchTerm}`
                } else if (debouncedSearchTerm === '') {
                    url = '/api/contacts'
                } else {
                    setLoading(false)
                    return
                }

                const response = await fetch(url)
                const data = await response.json()
                setContacts(data.data)
            } catch (error) {
                console.error("Failed to fetch contacts:", error)
                setContacts([])
            } finally {
                setLoading(false)
            }
        }
        fetchContacts()
    }, [debouncedSearchTerm])

    const handleSelectContact = async (contact: IContact) => {
        await fetch('/api/profile/set-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: contact.id }),
        })
        onUserSelected()
    }

    return (
        <ContactSelectorCombobox
            contacts={contacts}
            onSearch={setSearchTerm}
            onSelectContact={handleSelectContact}
            loading={loading}
        />
    )
}
