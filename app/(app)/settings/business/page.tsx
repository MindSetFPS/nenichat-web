import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { BusinessForm } from "@/components/forms/business-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";

export default async function BusinessSettingsPage() {
    const user = await requireAuth()
    const supabase = await createServerSupabaseClient();

    const { data: businesses } = await supabase
        .from('business')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1);

    const business = businesses && businesses.length > 0 ? businesses[0] : null;

    return (
        <>
            <PageHeader title="Configuración del Negocio" />
            <div className="max-w-2xl mx-auto mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                        <CardDescription>
                            Actualiza la información básica de tu negocio.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BusinessForm initialData={business} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
