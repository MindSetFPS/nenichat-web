import { CreateOrderForm } from "@/components/forms/create-order-form";
import { PageHeader } from "@/components/ui/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GoWappChatRepository } from "@/Nenichat/Chats/infra/api";
import { getJidKind } from "@/Nenichat/Chats/domain/Jid";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository";

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

    // Fetch contacts from Supabase
    const supabaseContactRepository = new SupabaseContactRepository(supabase);
    let dbContacts: any[] = [];
    try {
        dbContacts = await supabaseContactRepository.list(business.id, 0, 100);
    } catch (error) {
        console.error("Failed to fetch DB contacts:", error);
    }

    // Serialize contacts to plain objects
    const serializeContact = (c: any): IContact => ({
        id: c.id ?? null,
        business_id: c.business_id ?? business.id,
        phone_number_id: c.phone_number_id ?? null,
        phone_number: c.phone_number ?? null,
        lid: c.lid ?? null,
        username: c.username ?? null,
        pushname: c.pushname ?? null,
        contact_name: c.contact_name ?? null,
        is_user: c.is_user ?? false,
        is_hidden: c.is_hidden ?? false,
        created_at: c.created_at ? new Date(c.created_at) : new Date(),
        updated_at: c.updated_at ? new Date(c.updated_at) : new Date(),
    });

    // Map chat data to IContact format
    const chatContacts: IContact[] = contactsData.map((chat: any) => serializeContact({
        id: null,
        business_id: business.id,
        phone_number_id: null,
        phone_number: chat.jid?.split('@')[0] || null,
        lid: getJidKind(chat.jid || '') === 'lid' ? chat.jid?.split('@')[0] : null,
        username: null,
        pushname: chat.name || null,
        contact_name: null,
        is_user: false,
        is_hidden: false,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
    }));

    // Merge chat contacts with DB contacts (DB contacts take precedence if duplicate)
    const phoneNumberMap = new Map<string, IContact>();
    const lidMap = new Map<string, IContact>();
    
    // First add chat contacts
    for (const contact of chatContacts) {
        if (contact.phone_number) {
            phoneNumberMap.set(contact.phone_number, contact);
        }
        if (contact.lid) {
            lidMap.set(contact.lid, contact);
        }
    }
    
    // Then add DB contacts (will overwrite duplicates)
    for (const contact of dbContacts) {
        const serialized = serializeContact(contact);
        if (serialized.phone_number) {
            phoneNumberMap.set(serialized.phone_number, serialized);
        }
        if (serialized.lid) {
            lidMap.set(serialized.lid, serialized);
        }
    }
    
    const mergedContacts = [...phoneNumberMap.values(), ...lidMap.values()];
    
    return (
        <>
            <PageHeader title="Crear Nueva Orden" />
            <CreateOrderForm contacts={mergedContacts} className="mt-4" />
        </>
    );
}