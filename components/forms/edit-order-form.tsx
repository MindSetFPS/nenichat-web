"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { OrderForm, OrderFormValues } from "./order-form";
import { useProductStore } from "@/stores/product-store";

interface EditOrderFormProps {
    orderId: number;
    initialData: OrderFormValues;
    contacts: IContact[];
    className?: string;
    contact?: IContact; // The contact associated with the order
}

export function EditOrderForm({
    orderId,
    initialData,
    contacts,
    className,
    contact,
}: EditOrderFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { products, fetchProducts } = useProductStore();

    useEffect(() => {
        const loadProducts = async () => {
            if (products.length === 0) {
                await fetchProducts();
            }
        };
        loadProducts();
    }, [products.length, fetchProducts]);


    // We might need to ensure initialData.contactId corresponds to what OrderForm expects (string).
    // initialData comes from the page, let's assume it's correctly formatted or we wash it here.

    const handleSubmit = async (values: OrderFormValues) => {
        setLoading(true);
        try {
            const payload = {
                contact_id: values.contactId ? parseInt(String(values.contactId)) : null,
                lid: values.lid || null,
                items: values.items,
                shipping_address: values.shippingAddress,
                shipping_cost: values.shippingCost,
                status: values.status,
                payment_method: values.paymentMethod,
                amount_paid: values.amountPaid,
                payment_status: values.paymentStatus,
                notes: values.notes,
                created_at: values.createdAt, // Usually we don't update created_at on edit, but if passed
                total_amount: values.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0) + values.shippingCost,
            };

            const response = await fetch(`/api/orders/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to update order");
            }

            toast.success("Order updated successfully");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <OrderForm
            contacts={contacts}
            onSubmit={handleSubmit}
            isLoading={loading}
            submitLabel="Actualizar Orden"
            className={className}
            contact={contact}
            initialValues={initialData}
            products={products}
        />
    );
}
