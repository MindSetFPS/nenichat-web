import { NextResponse } from 'next/server';
import { pool } from '@/Nenichat/Shared/infra/persistance/db';
import { OrderRepository } from '@/Nenichat/Orders/infra/persistance/OrderRepository';
import { OrderItemRepository } from '@/Nenichat/Orders/infra/persistance/OrderItemRepository';

const orderRepository = new OrderRepository(pool);
const orderItemRepository = new OrderItemRepository(pool);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, ...orderData } = body;

        const newOrder = await orderRepository.create({
            ...orderData,
            refunded_amount: 0 // Default value
        }, items);

        return NextResponse.json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
