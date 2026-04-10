import { Package } from "lucide-react";
import { EmptyList } from "@/components/empty-list";
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository";
import { getContactName } from "@/Nenichat/Contacts/app/get-contact-name";
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

    // 1. Fetch WhatsApp chats once to avoid redundant API calls per order
    let chatMap = new Map<string, any>();
    try {
        const chats = await gowappChatRepository.list(0, 100);
        chats.forEach(chat => {
            chatMap.set(chat.jid, chat);
        });
    } catch (e) {
        console.error("Error fetching chats from GoWapp:", e);
    }

    // 2. Local cache for contacts to avoid redundant DB lookups
    const contactCache = new Map<number, any>();

    // 3. Process orders in batches to avoid overwhelming the network/cache stack.
    // When many concurrent 'fetch' calls occur (even nested in Promise.all), Next.js internal 
    // memoization and Data Cache can hit stack size limits (RangeError). 
    // Batching ensures concurrency stays at a manageable level.
    const BATCH_SIZE = 50;
    for (let i = 0; i < orders.length; i += BATCH_SIZE) {
        // Create a slice for the current batch
        const batch = orders.slice(i, i + BATCH_SIZE);
        
        // Process each batch concurrently
        await Promise.all(batch.map(async order => {
            // Resolve contact information if present
            if (order.contact_id) {
                // Use the local cache to avoid multiple DB lookups for the same contact
                let contact = contactCache.get(Number(order.contact_id));
                if (!contact) {
                    contact = await contactRepository.findById(business.id, Number(order.contact_id));
                    if (contact) contactCache.set(Number(order.contact_id), contact);
                }

                if (contact) {
                    let chatName: string | null = null;
                    
                    // Attempt to resolve the chat name from the pre-fetched WhatsApp chat list
                    const jid = contact.phone_number ? contact.phone_number + "@s.whatsapp.net" : contact.lid;
                    if (jid) {
                        const chat = chatMap.get(jid);
                        chatName = chat?.name || null;
                    }
                    
                    // Resolve final display name (Priority: Manual name > WhatsApp name > Phone/LID)
                    order.contact_name = getContactName(contact, chatName ? { name: chatName } as any : null) || "Unknown"
                }
            }
            
            // Fetch order line items for table display
            order.items = await orderRepository.getItems(business.id, order.id);
        }));
    }

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
