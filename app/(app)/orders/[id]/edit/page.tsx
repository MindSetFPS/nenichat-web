import { notFound } from "next/navigation";
import { SupabaseOrderRepository } from "@/Nenichat/Orders/infra/persistance/SupabaseOrderRepository";
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository";
import { EditOrderForm } from "@/components/forms/edit-order-form";
import { PageHeader } from "@/components/ui/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBusinessFromUser } from "@/lib/user-auth";

export const dynamic = 'force-dynamic';

interface EditOrderPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) notFound();

    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return <div>Unauthorized</div>;
    }

    const orderRepository = new SupabaseOrderRepository(supabase);
    const contactRepository = new SupabaseContactRepository(supabase);

    // Fetch order
    const order = await orderRepository.getById(business.id, orderId);
    if (!order) notFound();

    // Fetch order items with product info
    const items = await orderRepository.getItems(business.id, orderId);

    // Fetch all contacts for selection
    const contacts = await contactRepository.list(business.id, 0, 100);

    // Fetch the contact associated with this order
    let contact = null;
    if (order.contact_id) {
        contact = await contactRepository.findById(business.id, Number(order.contact_id));
    }

    // Serialize for client component
    const plainContacts = JSON.parse(JSON.stringify(contacts));
    const plainOrder = JSON.parse(JSON.stringify(order));
    const plainItems = JSON.parse(JSON.stringify(items));
    const plainContact = contact ? JSON.parse(JSON.stringify(contact)) : null;

    // Transform items to match CreateOrderForm's expected format
    const transformedItems = plainItems.map((item: any) => ({
        productId: item.product_id?.toString() || null,
        quantity: item.quantity,
        unitPrice: item.unit_price,
    }));

    return (
        <>
            <PageHeader title={`Editar Orden #${orderId}`} />
            <div className="overflow-scroll">
                <EditOrderForm
                    contacts={plainContacts}
                    contact={plainContact}
                    orderId={orderId}
                    initialData={{
                        status: plainOrder.status,
                        paymentMethod: plainOrder.payment_method,
                        amountPaid: plainOrder.amount_paid,
                        paymentStatus: plainOrder.payment_status,
                        notes: plainOrder.notes,
                        shippingAddress: plainOrder.shipping_address,
                        shippingCost: plainOrder.shipping_cost,
                        items: transformedItems,
                        contactId: order.contact_id ? String(order.contact_id) : "",
                    }}
                    className="mt-4"
                />
            </div>
        </>
    );
}
