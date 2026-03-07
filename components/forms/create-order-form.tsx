"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { OrderForm, OrderFormValues } from "./order-form";
import { useProductStore } from "@/stores/product-store";
import { IProduct } from "@/Nenichat/Products/domain/IProduct";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface CreateOrderFormProps {
    contacts?: IContact[];
    contactId?: string;
    lid?: string;
    contact?: IContact;
    createdAt?: Date;
    className?: string;
    onSubmit?: () => void;
}

export function CreateOrderForm({
    contacts,
    contactId,
    lid,
    contact,
    createdAt,
    className,
    onSubmit,
}: CreateOrderFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { products, fetchProducts, updateProduct } = useProductStore();
    const supabase = createBrowserSupabaseClient();

    let activeProducts: IProduct[];

    useEffect(() => {
        const loadProducts = async () => {
            if (products.length === 0) {
                await fetchProducts();
            }
        };
        loadProducts();
    }, [products.length, fetchProducts]);

    activeProducts = products.filter((product) => product.is_active);

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
                created_at: values.createdAt || createdAt,
                // Total amount is calculated on backend usually or derived? 
                // In original it was calculated on client and sent.
                total_amount: values.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0) + values.shippingCost,
            };

            const response = await fetch("/api/orders/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Error al crear el pedido");
            }

            toast.success("Pedido creado con éxito");

            // Update product stock (Client-side implementation)
            for (const item of values.items) {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const newStock = product.stock - item.quantity;
                    const { error: stockError } = await supabase
                        .from('products')
                        .update({ stock: newStock })
                        .eq('id', product.id);

                    if (!stockError) {
                        updateProduct({
                            ...product,
                            stock: newStock
                        });
                    } else {
                        console.error(`Failed to update stock for product ${product.id}:`, stockError);
                    }
                }
            }

            onSubmit?.();
            router.push("/orders");
        } catch (error) {
            console.error(error);
            toast.error("Error al crear el pedido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <OrderForm
            contacts={contacts || []}
            onSubmit={handleSubmit}
            isLoading={loading}
            submitLabel="Crear Orden"
            className={className}
            contact={contact}
            initialValues={{
                contactId: contactId,
                lid: lid,
            }}
            products={activeProducts!}
        />
    );
}
