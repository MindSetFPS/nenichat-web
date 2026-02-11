import WhatsAppSetupPage from "@/components/connections/whatsapp/whatsapp-setup-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { container_states } from "@/Nenichat/Containers/Domain/container-states";
import { AlertTriangle, Ban, CheckCircle2, RefreshCcw } from "lucide-react";

/**
 * WhatsApp connections page.
 * 
 * This server component verifies if the user is authenticated and if they have
 * an associated business record in the database before allowing them to access
 * the WhatsApp setup process.
 * 
 * @returns {Promise<JSX.Element>} The WhatsApp setup page or a prompt to create a business.
 */
export default async function WhatsAppPage() {
    const user = await requireAuth();

    // 2. Check if the business table has a row with this user's ID (owner_id)
    const { data: businesses, error: businessesError } = await supabase
        .from('business')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);

    const hasBusiness = businesses && businesses.length > 0;

    if (hasBusiness) {
        // Check if user already has a container deployed
        const { data: containers, error: containersError } = await supabase
            .from('whatsapp-containers')
            .select('*')
            .eq('business_id', businesses[0].id)
            .limit(1);

        const hasContainers = containers && containers.length > 0;

        if (hasContainers) {
            const container = containers[0];
            const status = container.status as container_states;

            if (status === 'connected') {
                return (
                    <div className="flex items-center justify-center min-h-[60vh] p-4">
                        <Card className="w-full max-w-md border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800 rounded-4xl">
                            <CardHeader className="text-center">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-green-800 shadow-sm">
                                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
                                </div>
                                <CardTitle className="text-2xl font-black text-green-700 dark:text-green-400">WhatsApp Conectado</CardTitle>
                                <CardDescription className="text-base">Tu cuenta está vinculada y lista para recibir mensajes en tiempo real.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 pb-10">
                                <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-green-100 dark:border-green-900/50 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Estado</span>
                                        <span className="font-bold text-green-600">Activo</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">ID de Instancia</span>
                                        <span className="font-mono text-xs">{container.container_id || 'N/A'}</span>
                                    </div>
                                </div>
                                <Button asChild variant="outline" className="w-full rounded-2xl h-12">
                                    <Link href="/settings/connections/whatsapp?reconnect=true">
                                        <RefreshCcw className="mr-2 h-4 w-4" />
                                        Forzar nueva vinculación
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                );
            }

            if (status === 'error') {
                return (
                    <div className="flex items-center justify-center min-h-[60vh] p-4">
                        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5 dark:bg-destructive/10 rounded-4xl">
                            <CardHeader className="text-center">
                                <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="h-10 w-10 text-destructive" />
                                </div>
                                <CardTitle className="text-2xl font-black text-destructive">Error de Conexión</CardTitle>
                                <CardDescription className="text-base">Hemos detectado un problema con tu instancia de WhatsApp.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 pb-10">
                                <p className="text-sm text-center text-muted-foreground">
                                    Esto puede deberse a un problema técnico con el servidor o a que la sesión expiró prematuramente.
                                </p>
                                <Button asChild className="w-full rounded-2xl h-14 text-lg font-bold bg-destructive hover:bg-destructive/90 text-white shadow-xl shadow-destructive/20 transition-all hover:scale-[1.02]">
                                    <Link href="/settings/connections/whatsapp?reconnect=true">
                                        Reiniciar Configuración
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                );
            }

            if (status === 'stopped') {
                return (
                    <div className="flex items-center justify-center min-h-[60vh] p-4">
                        <Card className="w-full max-w-md border-muted-foreground/20 bg-muted/30 dark:bg-muted/10 rounded-4xl">
                            <CardHeader className="text-center">
                                <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-4">
                                    <Ban className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <CardTitle className="text-2xl font-black">Instancia Detenida</CardTitle>
                                <CardDescription className="text-base">Tu conexión de WhatsApp ha sido suspendida.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 pb-10">
                                <p className="text-sm text-center text-muted-foreground">
                                    Tu instancia ha sido detenida. Esto puede deberse a falta de pago, violación de términos o mantenimiento programado.
                                </p>
                                <Button asChild variant="secondary" className="w-full rounded-2xl h-12">
                                    <Link href="/support">
                                        Contactar Soporte
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                );
            }

            if (status === 'deployed') {
                // If deployed, go straight to QR scanning step
                return <WhatsAppSetupPage
                    businessId={businesses[0].id}
                    initialStep={2}
                    initialQrCode={container.qr_code}
                    initialQrCodeUpdatedAt={container.qr_code_updated_at}
                />;
            }

            // Fallback for 'empty' or 'created' states - show initial setup
            return <WhatsAppSetupPage businessId={businesses[0].id} />;
        }
    }

    // 3. If business exists (but no containers), render the setup page
    if (hasBusiness) {
        return <WhatsAppSetupPage businessId={businesses[0].id} />;
    }

    // 4. Otherwise, prompt the user to complete their business configuration
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <div className="w-full max-w-md">
                <Card className="border-2 border-dashed border-muted-foreground/20 rounded-4xl bg-card/50 backdrop-blur-sm">
                    <CardHeader className="text-center space-y-3 pt-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                            <span className="text-3xl">🏢</span>
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tight">¡Configuración Pendiente!</CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            Para poder conectar tu cuenta de WhatsApp, primero necesitas completar la información de tu negocio.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center pt-4 pb-10">
                        <Button asChild className="w-full rounded-2xl h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl transition-all hover:translate-y-[-2px] active:translate-y-0">
                            <Link href="/home">
                                Configurar Negocio
                            </Link>
                        </Button>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Esto solo tomará un minuto.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

