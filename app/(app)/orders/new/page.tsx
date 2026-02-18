import { CreateOrderForm } from "@/components/forms/create-order-form";
import { PageHeader } from "@/components/ui/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GoWappChatRepository } from "@/Nenichat/Chats/infra/api";

export const dynamic = 'force-dynamic';

export default async function NewOrderPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) console.error(userError)

    // what business' contacts to retrieve
    const { data: business, error: businessError } = await supabase
        .from("business")
        .select("id")
        .eq("owner_id", user?.id)
        .single();

    if (businessError) console.error(businessError)

    if (!business) {
        return <div>No tienes un negocio</div>;
    }

    const { data: containerData, error: containerError } = await supabase
        .from("whatsapp-containers")
        .select("*")
        .eq("business_id", business.id)
        .single();

    if (containerError) console.error(containerError)

    let contactsData: any[] = [];
    if (!containerData) {
        contactsData = [];
    } else {
        const url = "http://192.168.1.64" + "/api/user" + "/" + business.id
        const chatRepository = new GoWappChatRepository(url, "admin", "admin")
        contactsData = await chatRepository.list(0, 26);
    }

    const contacts = contactsData
    // Serialize for client component
    const plainContacts = JSON.parse(JSON.stringify(contacts));
    return (
        <>
            <PageHeader title="Crear Nueva Orden" />
            <CreateOrderForm contacts={plainContacts} className="mt-4" />
        </>
    );
}