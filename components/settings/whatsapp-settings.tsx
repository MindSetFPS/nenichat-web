'use client'

import { useState, useEffect } from 'react'
import WhatsAppSetupPage from "@/components/connections/whatsapp/whatsapp-setup-page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { container_states } from "@/Nenichat/Containers/Domain/container-states"
import { AlertTriangle, Ban, CheckCircle2, RefreshCcw, Building2 } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { useSearchParams } from 'next/navigation'

/**
 * @function WhatsAppSettings
 * @description Renders the WhatsApp connection settings view.
 */
export function WhatsAppSettings() {
    const [loading, setLoading] = useState(true)
    const [businessId, setBusinessId] = useState<number | null>(null)
    const [container, setContainer] = useState<any>(null)
    const supabase = createBrowserSupabaseClient()
    const searchParams = useSearchParams()
    const reconnect = searchParams.get('reconnect') === 'true'

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // 1. Get business
                const { data: businesses } = await supabase
                    .from('business')
                    .select('id')
                    .eq('owner_id', user.id)
                    .limit(1)

                if (!businesses || businesses.length === 0) {
                    setLoading(false)
                    return
                }

                const bId = businesses[0].id
                setBusinessId(bId)

                // 2. Get container
                const { data: containers } = await supabase
                    .from('whatsapp-containers')
                    .select('*')
                    .eq('business_id', bId)
                    .limit(1)

                if (containers && containers.length > 0) {
                    setContainer(containers[0])
                }
            } catch (err) {
                console.error('Error fetching WhatsApp data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        )
    }

    if (!businessId) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">¡Configuración Pendiente!</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Para poder conectar tu cuenta de WhatsApp, primero necesitas completar la información de tu negocio.
                    </p>
                </div>
                <Button asChild className="rounded-2xl">
                    <Link href="/home">Configurar Negocio</Link>
                </Button>
            </div>
        )
    }

    if (container && !reconnect) {
        const status = container.status as container_states

        if (status === 'connected') {
            return (
                <div className="space-y-4">
                    <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800 rounded-3xl">
                        <CardHeader className="text-center pb-2">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
                            </div>
                            <CardTitle className="text-xl font-bold text-green-700 dark:text-green-400">WhatsApp Conectado</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pb-6">
                            <div className="bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-green-100 dark:border-green-900/50 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Estado</span>
                                    <span className="font-bold text-green-600">Activo</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">ID de Instancia</span>
                                    <span className="font-mono text-xs">{container.container_id || 'N/A'}</span>
                                </div>
                            </div>
                            <Button asChild variant="outline" className="w-full rounded-xl">
                                <Link href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); window.location.search = '?reconnect=true'; }}>
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Forzar nueva vinculación
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )
        }

        if (status === 'error') {
            return (
                <Card className="border-destructive/20 bg-destructive/5 dark:bg-destructive/10 rounded-3xl">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                        <CardTitle className="text-xl font-bold text-destructive">Error de Conexión</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-6">
                        <p className="text-sm text-center text-muted-foreground">
                            Hemos detectado un problema con tu instancia de WhatsApp.
                        </p>
                        <Button asChild className="w-full rounded-xl font-bold bg-destructive hover:bg-destructive/90 text-white">
                            <Link href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); window.location.search = '?reconnect=true'; }}>
                                Reiniciar Configuración
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )
        }

        if (status === 'stopped') {
            return (
                <Card className="border-muted-foreground/20 bg-muted/30 dark:bg-muted/10 rounded-3xl">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-2">
                            <Ban className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-xl font-bold">Instancia Detenida</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Tu conexión ha sido suspendida. Contacta a soporte para más información.
                        </p>
                        <Button asChild variant="secondary" className="w-full rounded-xl">
                            <Link href="/support">Contactar Soporte</Link>
                        </Button>
                    </CardContent>
                </Card>
            )
        }

        if (status === 'deployed') {
            return <WhatsAppSetupPage
                businessId={businessId.toString()}
                initialStep={2}
                initialQrCode={container.qr_code}
                initialQrCodeUpdatedAt={container.qr_code_updated_at}
            />
        }
    }

    // Default setup flow
    return <WhatsAppSetupPage businessId={businessId.toString()} />
}
