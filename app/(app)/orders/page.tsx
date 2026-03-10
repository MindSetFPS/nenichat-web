import { Package } from "lucide-react";
import { EmptyList } from "@/components/empty-list";
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository";
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier";
import { OrderWithContactName } from "@/Nenichat/Orders/app/dto/order-with-contact-name";
import { CreateOrderButton } from "@/components/orders/create-order-button";
import { PageHeader } from "@/components/ui/page-header";
import { SupabaseOrderRepository } from "@/Nenichat/Orders/infra/persistance/SupabaseOrderRepository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { IOrderRepository } from "@/Nenichat/Orders/domain/IOrderRepository";
import { getBusinessFromUser } from "@/lib/user-auth";
import { OrdersTableClient } from "./orders-table-client";
import { GoWappChatRepository } from "@/Nenichat/Chats/infra/api";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return <div>{authError || "No tienes un negocio o no estás autorizado"}</div>;
    }

    const orderRepository: IOrderRepository = new SupabaseOrderRepository(supabase);
    const contactRepository = new SupabaseContactRepository(supabase);

    const gowappBaseUrl = "http://192.168.1.64/api/user/" + business.id
    const gowappChatRepository = new GoWappChatRepository(gowappBaseUrl, "admin", "admin")

    let orders: OrderWithContactName[] = await orderRepository.getAll(business.id);

    orders = await Promise.all(orders.map(async order => {
        if (order.contact_id) {
            const contact = await contactRepository.findById(business.id, Number(order.contact_id));
            if (contact) {
                let chatName: string | null = null;
                
                // Try to get chat name from GoWapp as fallback
                if (contact.phone_number) {
                    const jid = contact.phone_number + "@s.whatsapp.net"
                    const chat = await gowappChatRepository.findById(jid)
                    chatName = chat?.name || null
                } else if (contact.lid) {
                    const chat = await gowappChatRepository.findById(contact.lid)
                    chatName = chat?.name || null
                }

                // Priority: contact.contact_name > chatName > getContactIdentifier(contact)
                order.contact_name = contact.contact_name || chatName || getContactIdentifier(contact) || "Unknown"
            }
        }
        order.items = await orderRepository.getItems(business.id, order.id);
        return order;
    }));

    const plainOrders = JSON.parse(JSON.stringify(orders));

    if (plainOrders.length === 0) {
        return (
            <>
                <PageHeader />
                <EmptyList
                    title="Sin ordenes"
                    description="Cuando hagas tu primera orden aparecerá aquí."
                    action={<CreateOrderButton />}
                    icon={<Package className="w-16 h-16 text-primary" strokeWidth={1.5} />}
                />
            </>
        )
    }

    return (
        <>
            <PageHeader title="Ventas">
                <CreateOrderButton />
            </PageHeader>
            <OrdersTableClient
                orders={plainOrders}
            />
        </>
    );
}
