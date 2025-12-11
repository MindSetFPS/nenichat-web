import { NextResponse } from "next/server";
import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository";
import { OrderItemRepository } from "@/Nenichat/Orders/infra/persistance/OrderItemRepository";

const orderRepository = new OrderRepository(pool);
const orderItemRepository = new OrderItemRepository(pool);

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });

    try {
        const body = await request.json();
        const {
            contact_id,
            items,
            shipping_address,
            shipping_cost,
            status,
            payment_method,
            amount_paid,
            payment_status,
            notes,
            total_amount,
        } = body;

        // Update order details
        const updatedOrder = await orderRepository.update(orderId, {
            contact_id,
            shipping_address,
            shipping_cost,
            status,
            payment_method,
            amount_paid,
            payment_status,
            notes,
            total_amount,
        } as any);

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
            const serverOrderProducts = await orderItemRepository.getByOrderId(orderId);

            for (const item of serverOrderProducts) {
                await orderItemRepository.delete(item.id);
            }

            // Recreate all items
            for (const item of clientOrderProducts) {
                console.log(item)
                await orderItemRepository.create({
                    order_id: orderId,
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    total_price: item.totalPrice || (item.quantity * item.unitPrice), // too lazy to fix this in client
                } as any);
            }
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
    if (isNaN(parseInt(id))) {
        return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    try {
        const result = await orderRepository.delete(parseInt(id));
        console.log(result);
        return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
