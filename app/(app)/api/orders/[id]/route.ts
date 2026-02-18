import { NextResponse } from "next/server";
import { SupabaseOrderRepository } from "@/Nenichat/Orders/infra/persistance/SupabaseOrderRepository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBusinessFromUser } from "@/lib/user-auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });

    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);
    const orderRepository = new SupabaseOrderRepository(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Extract items separately as it's handled differently
        const { items } = body;

        // Define allowed fields for order update
        const allowedFields = [
            'contact_id',
            'shipping_address',
            'shipping_cost',
            'status',
            'payment_method',
            'amount_paid',
            'payment_status',
            'notes',
            'total_amount',
        ];

        // Construct updates object with only defined fields
        const updates: any = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        // Update order details
        const updatedOrder = await orderRepository.update(business.id, orderId, updates);

        if (!updatedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // we need to find what to add, what do delete and what to ignore
        // but wait, maybe items is still the same, but the quantity changed, or the unit price, or the total price.
        // in such case, we need to update the items as well
        // we kind of already did that for audiences, but right now im to lazy so we delete everything an recreate it

        let clientOrderProducts = items as any[];

        // if you leave clientOrderProducts empty, we do notin
        if (clientOrderProducts && clientOrderProducts.length > 0) {
            // Delete existing items
            await supabase.from('order_items').delete().eq('order_id', orderId);

            // Recreate all items
            const newItems = clientOrderProducts.map(item => ({
                order_id: orderId,
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total_price: item.totalPrice || (item.quantity * item.unitPrice),
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(newItems);
            if (itemsError) throw itemsError;
        }

        return NextResponse.json({
            message: 'Order updated successfully',
            order: updatedOrder,
        });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
        return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);
    const orderRepository = new SupabaseOrderRepository(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await orderRepository.delete(business.id, orderId);
        return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
