'use client'

import { useState, useEffect } from "react"
import { User as UserIcon, LogOut, Calendar, AtSign, Phone, Fingerprint } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { IContact } from "@/Nenichat/Contacts/domain/IContact"
import { User } from "@supabase/supabase-js"
import { ProfileSelectorCombobox } from "./profile-selector-combobox"

/**
 * @function AccountSettings
 * @description Renders the consolidated account and profile settings view.
 */
export function AccountSettings() {
    const [user, setUser] = useState<IContact | null>(null)
    const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createBrowserSupabaseClient()
    const router = useRouter()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const [profileRes, authRes] = await Promise.all([
                    fetch('/api/profile'),
                    supabase.auth.getUser()
                ])

                if (profileRes.ok) {
                    const userData = await profileRes.json()
                    setUser(userData)
                }

                if (authRes.data.user) {
                    setSupabaseUser(authRes.data.user)
                }
            } catch (error) {
                console.error('Failed to fetch user', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <div className="grid grid-cols-1 gap-6">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
            </div>
        )
    }

    if (!user && !supabaseUser) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-2xl">
                    <UserIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Perfil no encontrado</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    No pudimos encontrar los datos de tu perfil. Por favor selecciona un contacto para vincularlo a tu cuenta.
                </p>
                <div className="w-full mt-4">
                    <ProfileSelector onUserSelected={() => window.location.reload()} />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header / Hero Section */}
            <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-primary/5 via-primary/10 to-transparent p-6 border border-primary/10">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 relative z-10">
                    <div className="relative">
                        <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-background shadow-xl">
                            <AvatarImage src={''} alt={user?.pushname || user?.username || supabaseUser?.email || 'User'} />
                            <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-bold">
                                {(user?.pushname || user?.username || supabaseUser?.email || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background shadow-lg" />
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-1">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <h2 className="text-2xl font-black tracking-tight uppercase">
                                {user?.pushname || user?.username || 'Bienvenido'}
                            </h2>
                            {supabaseUser && (
                                <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-background/50 border">
                                    {supabaseUser.aud}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium truncate">
                            {supabaseUser?.email}
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground pt-2">
                            <Calendar className="w-3 h-3 text-primary" />
                            <span>Desde {supabaseUser ? new Date(supabaseUser.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Recientemente'}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="absolute top-0 right-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <LogOut className="w-4 h-4" />
                        <span className="sr-only">Salir</span>
                    </Button>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* WhatsApp Profile Section */}
                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden rounded-2xl">
                    <CardHeader className="">
                        <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-primary" />
                            <CardTitle className="text-sm font-bold uppercase tracking-tight opacity-80">Perfil de WhatsApp</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {user ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-dashed">
                                    <InfoItem icon={<UserIcon className="w-3.5 h-3.5" />} label="Nombre" value={user.pushname || user.contact_name} />
                                    <InfoItem icon={<Phone className="w-3.5 h-3.5" />} label="Teléfono" value={user.phone_number} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <InfoItem icon={<AtSign className="w-3.5 h-3.5" />} label="Username" value={user.username} />
                                    <InfoItem icon={<Fingerprint className="w-3.5 h-3.5" />} label="LID" value={user.lid} mono />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground mb-2">Vincula un contacto para ver los detalles aquí.</p>
                                <ProfileSelector onUserSelected={() => window.location.reload()} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function InfoItem({ icon, label, value, mono = false }: { icon: React.ReactNode, label: string, value: string | null | undefined, mono?: boolean }) {
    return (
        <div className="space-y-1.5 group">
            <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</span>
            </div>
            <div className={`px-3 py-2.5 rounded-xl bg-background border border-border/50 group-hover:border-primary/20 transition-all ${mono ? 'font-mono text-xs break-all' : 'text-sm font-bold'}`}>
                {value || 'No disponible'}
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

    const handleSelectContact = async (contactId: string) => {
        await fetch('/api/profile/set-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: contactId }),
        })
        onUserSelected()
    }

    return (
        <ProfileSelectorCombobox
            contacts={contacts}
            onSearch={setSearchTerm}
            onSelectContact={handleSelectContact}
            loading={loading}
        />
    )
}
