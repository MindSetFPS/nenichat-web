'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    User,
    EyeOff,
    ChevronRight,
    Lock,
    MessageCircle,
    Building2,
    Palette,
    ShieldCheck,
    CreditCard,
    Sparkles,
    LogOut,
    ArrowRight
} from "lucide-react"
import { motion } from "motion/react"
import { ModeToggle } from "@/components/mode-toggle"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader as UiCardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null)
    const supabase = createBrowserSupabaseClient()
    const router = useRouter()

    useEffect(() => {
        fetch('/api/profile')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setProfile(data)
            })
            .catch(err => console.error('Error fetching profile:', err))
    }, [])

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const sections = [
        {
            id: 'account',
            title: "Cuenta",
            description: "Gestiona los detalles de tu perfil y seguridad.",
            icon: User,
            items: [
                { label: "Perfil", href: "/profile", icon: User, description: "Cambia tu nombre y foto de perfil" },
                { label: "Negocio", href: "/settings/business", icon: Building2, description: "Información de tu marca" },
            ]
        },
        {
            id: 'connections',
            title: "Conexiones",
            description: "Integra Nenichat con tus apps favoritas.",
            icon: Sparkles,
            items: [
                { label: "WhatsApp", href: "/settings/connections/whatsapp", icon: MessageCircle, description: "Conecta tu cuenta de WhatsApp Business" },
            ]
        },
        {
            id: 'privacy',
            title: "Privacidad",
            description: "Controla quién puede ver tu info y contactarte.",
            icon: ShieldCheck,
            items: [
                { label: "Contactos Ocultos", href: "/settings/hidden-contacts", icon: EyeOff, description: "Gestiona los contactos que has ocultado" },
            ]
        },
        {
            id: 'billing',
            title: "Suscripciones",
            description: "Planes, facturación y métodos de pago.",
            icon: CreditCard,
            items: [
                { label: "Planes de Suscripción", href: "/settings/subscriptions", icon: Lock, description: "Ver y gestionar tus planes" },
            ]
        }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.4
            }
        }
    }

    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Configuración" />

            <main className="flex-1 overflow-y-auto mx-auto w-full space-y-8 ">
                {/* Profile Hero Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="overflow-hidden border-none shadow-xl bg-linear-to-br from-primary/10 via-background to-background backdrop-blur-md relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative z-10">
                            <div className="relative group">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-2xl transition-transform duration-300 group-hover:scale-105">
                                    <AvatarImage src={profile?.avatar_url} />
                                    <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                                        {profile?.name?.charAt(0) || profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || <User className="h-10 w-10" />}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-4 border-background rounded-full shadow-lg" />
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-1">
                                <h1 className="text-3xl font-extrabold tracking-tight">
                                    {profile?.name || profile?.full_name || profile?.username || "Cargando..."}
                                </h1>
                                <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
                                    <span className="opacity-70">{profile?.email || "Actualiza tu perfil"}</span>
                                    {profile?.business_name && (
                                        <>
                                            <span className="h-1 w-1 rounded-full bg-muted-foreground opacity-30" />
                                            <span className="text-primary/80">{profile.business_name}</span>
                                        </>
                                    )}
                                </p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                                    <Button variant="outline" size="sm" className="rounded-full bg-background/50 hover:bg-background transition-all border-primary/20" asChild>
                                        <Link href="/profile" className="flex items-center gap-2">
                                            Editar Perfil <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                    {profile?.is_premium && (
                                        <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-xs font-bold border border-amber-500/20 flex items-center gap-1 shadow-xs shadow-amber-500/10 animate-pulse">
                                            <Sparkles className="h-3 w-3" /> Premium
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {sections.map((section) => (
                        <motion.div key={section.id} variants={itemVariants}>
                            <Card className="h-full border-border/40 bg-card/40 backdrop-blur-md hover:bg-card/70 transition-all duration-300 group shadow-sm hover:shadow-md">
                                <UiCardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-xs shadow-primary/20">
                                            <section.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold tracking-tight">{section.title}</CardTitle>
                                            <CardDescription className="text-sm">{section.description}</CardDescription>
                                        </div>
                                    </div>
                                </UiCardHeader>
                                <CardContent className="space-y-2">
                                    {section.items.map((item, idx) => (
                                        <Link key={idx} href={item.href} className="block group/item">
                                            <div className="flex items-center p-3.5 rounded-2xl hover:bg-background transition-all border border-transparent hover:border-primary/10 hover:shadow-sm">
                                                <div className="h-11 w-11 rounded-xl bg-muted/50 flex items-center justify-center mr-4 group-hover/item:bg-primary/5 transition-colors">
                                                    <item.icon className="h-5.5 w-5.5 text-foreground/70 group-hover/item:text-primary transition-colors" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-sm group-hover/item:text-primary transition-colors truncate">{item.label}</h3>
                                                    <p className="text-xs text-muted-foreground line-clamp-1 group-hover/item:text-muted-foreground/80">{item.description}</p>
                                                </div>
                                                <div className="ml-2 h-8 w-8 rounded-full flex items-center justify-center opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all bg-primary/5">
                                                    <ChevronRight className="h-4 w-4 text-primary" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}

                    {/* Appearance Section */}
                    <motion.div variants={itemVariants}>
                        <Card className="h-full border-border/40 bg-card/40 backdrop-blur-md hover:bg-card/70 transition-all duration-300 group shadow-sm hover:shadow-md">
                            <UiCardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-xs shadow-primary/20">
                                        <Palette className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold tracking-tight">Apariencia</CardTitle>
                                        <CardDescription className="text-sm">Personaliza tu experiencia visual.</CardDescription>
                                    </div>
                                </div>
                            </UiCardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4.5 rounded-2xl bg-muted/40 border border-border/30 hover:bg-muted/60 transition-colors">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-sm">Tema del sistema</h3>
                                        <p className="text-xs text-muted-foreground">Cambia entre modo claro y oscuro</p>
                                    </div>
                                    <ModeToggle />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Logout Section */}
                    <motion.div variants={itemVariants}>
                        <Card className="h-full border-dashed border-border/60 bg-transparent hover:bg-destructive/5 transition-all duration-300 group overflow-hidden relative min-h-[160px]">
                            <CardContent className="h-full flex flex-col items-center justify-center p-8 space-y-4">
                                <div className="p-4 rounded-full bg-destructive/10 text-destructive group-hover:scale-110 group-hover:bg-destructive group-hover:text-white transition-all duration-300">
                                    <LogOut className="h-8 w-8" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg">Cerrar Sesión</h3>
                                    <p className="text-sm text-muted-foreground">¿Deseas salir de tu cuenta?</p>
                                </div>
                                <Button
                                    variant="destructive"
                                    className="rounded-full px-8 shadow-lg shadow-destructive/20 font-bold hover:scale-105 transition-transform"
                                    onClick={handleLogout}
                                >
                                    Salir ahora
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    )
}