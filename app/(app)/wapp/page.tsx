import { WhatsAppSettings } from "@/components/settings/whatsapp-settings";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBusinessFromUser } from "@/lib/user-auth";

export const metadata = {
    title: "Conexiones",
    description: "Configura y administra tus conexiones de WhatsApp en Nenichat.",
}

export default async function WappPage() {

    const supabase = await createServerSupabaseClient()
    const { business, error: authError } = await getBusinessFromUser(supabase)

    if (authError || !business) {
        return <div>No autorizado</div>
    }

    return (
        <WhatsAppSettings />
    )
}