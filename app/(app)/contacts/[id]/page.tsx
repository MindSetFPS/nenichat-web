import { notFound } from "next/navigation";
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository";
import { SupabaseOrderRepository } from "@/Nenichat/Orders/infra/persistance/SupabaseOrderRepository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBusinessFromUser } from "@/lib/user-auth";
import { ContactClientPage } from "./client";

export const dynamic = 'force-dynamic';

interface ContactDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
    const { id } = await params;
    const contactId = Number(id);

    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return <div>Unauthorized</div>;
    }

    const contactRepository = new SupabaseContactRepository(supabase);
    const orderRepository = new SupabaseOrderRepository(supabase);

    let contact = await contactRepository.findById(business.id, contactId);
    if (!contact) {
        notFound();
    }

    // Fetch orders for this contact
    const orders = await orderRepository.getByContactId(business.id, contactId);
    const ordersByDay = await orderRepository.getOrdersCountByDayOfWeek(business.id, contactId);

    // Serialize for client component
    const plainOrders = JSON.parse(JSON.stringify(orders));
    const plainContact = JSON.parse(JSON.stringify(contact));

    return (
        <ContactClientPage
            initialContact={plainContact}
            orders={plainOrders}
            ordersByDay={ordersByDay}
        />
    );
}
