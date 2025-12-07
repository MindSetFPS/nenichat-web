import { NextResponse } from "next/server";
import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository";

const orderRepository = new OrderRepository(pool);

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
