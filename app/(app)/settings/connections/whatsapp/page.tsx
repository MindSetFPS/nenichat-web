import WhatsAppSetupPage from "@/components/connections/whatsapp/whatsapp-setup-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

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
    const user = await requireAuth()
    // 2. Check if the business table has a row with this user's ID (owner_id)
    const { data: businesses } = await supabase
        .from('business')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);

    const hasBusiness = businesses && businesses.length > 0;

    // 3. If business exists, render the setup page
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
