'use client'

import { useEffect } from "react"
import { User, LogOut, ArrowRight } from "lucide-react"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

import { useUserStore } from "@/stores/user-store"

/**
 * @function ProfileSettings
 * @description Renders the profile/account settings view.
 */
export function ProfileSettings() {
    const { user: profile, fetchUser } = useUserStore()
    const supabase = createBrowserSupabaseClient()
    const router = useRouter()

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="overflow-hidden border-none shadow-lg bg-linear-to-br from-primary/10 via-background to-background backdrop-blur-md relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                    <CardContent className="p-6 flex flex-col items-center gap-6 relative z-10">
                        <div className="relative group">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-2xl transition-transform duration-300 group-hover:scale-105">
                                <AvatarImage src={profile?.avatar_url} />
                                <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                                    {profile?.name?.charAt(0) || profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || <User className="h-10 w-10" />}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-4 border-background rounded-full shadow-lg" />
                        </div>

                        <div className="text-center space-y-1">
                            <h1 className="text-2xl font-extrabold tracking-tight">
                                {profile?.name || profile?.full_name || profile?.username || "Cargando..."}
                            </h1>
                            <p className="text-muted-foreground font-medium flex items-center justify-center gap-2">
                                <span className="opacity-70">{profile?.email || "Actualiza tu perfil"}</span>
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                <Button variant="outline" size="sm" className="rounded-full bg-background/50 hover:bg-background transition-all border-primary/20" asChild>
                                    <Link href="/profile" className="flex items-center gap-2">
                                        Editar Perfil <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <Card className="border-dashed border-border/60 bg-transparent hover:bg-destructive/5 transition-all duration-300 group overflow-hidden relative">
                <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-destructive/10 text-destructive group-hover:scale-110 group-hover:bg-destructive group-hover:text-white transition-all duration-300">
                            <LogOut className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold">Cerrar Sesión</h3>
                            <p className="text-sm text-muted-foreground">¿Deseas salir de tu cuenta?</p>
                        </div>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-full px-6 shadow-lg shadow-destructive/20 font-bold hover:scale-105 transition-transform"
                        onClick={handleLogout}
                    >
                        Salir
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
