import { notFound } from "next/navigation";
import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository";
import { OrderItemRepository } from "@/Nenichat/Orders/infra/persistance/OrderItemRepository";
import { ContactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { ProductRepository } from "@/Nenichat/Products/infra/persistance/ProductRepository";
import { CreateOrderForm } from "@/components/forms/create-order-form";
import { HeaderAction } from "@/components/header-action";

const orderRepository = new OrderRepository(pool);
const orderItemRepository = new OrderItemRepository(pool);
const contactRepository = new ContactRepository(pool);
const productRepository = new ProductRepository(pool);

export const dynamic = 'force-dynamic';

interface EditOrderPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
        notFound();
    }

    // Fetch order
    const order = await orderRepository.getById(orderId);
    if (!order) {
        notFound();
    }

    // Fetch order items with product info
    const items = await orderItemRepository.getByOrderIdWithProduct(orderId);

    // Fetch all contacts for selection
    const contacts = await contactRepository.list(0, 100);

    // Fetch all products for selection
    const products = await productRepository.getAll();

    // Fetch the contact associated with this order
    let contact = null;
    if (order.contact_id) {
        contact = await contactRepository.findById(BigInt(order.contact_id));
    }

    // Serialize for client component
    const plainContacts = JSON.parse(JSON.stringify(contacts));
    const plainProducts = JSON.parse(JSON.stringify(products));
    const plainOrder = JSON.parse(JSON.stringify(order));
    const plainItems = JSON.parse(JSON.stringify(items));
    const plainContact = contact ? JSON.parse(JSON.stringify(contact)) : null;

    // Transform items to match CreateOrderForm's expected format
    const transformedItems = plainItems.map((item: any) => ({
        product_id: item.product_id?.toString() || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
    }));

    return (
        <>
            <HeaderAction>
                <h1 className="text-3xl font-bold tracking-tight">Edit Order #{orderId}</h1>
            </HeaderAction>
            <div className="overflow-scroll">
                <CreateOrderForm
                    contacts={plainContacts}
                    contactId={order.contact_id ? String(order.contact_id) : undefined}
                    contact={plainContact}
                    orderId={orderId}
                    initialStatus={plainOrder.status}
                    initialPaymentMethod={plainOrder.payment_method}
                    initialAmountPaid={plainOrder.amount_paid}
                    initialPaymentStatus={plainOrder.payment_status}
                    initialNotes={plainOrder.notes}
                    initialShippingAddress={plainOrder.shipping_address}
                    initialShippingCost={plainOrder.shipping_cost}
                    initialItems={transformedItems}
                    className="mt-4"
                />
            </div>
        </>
    );
}
