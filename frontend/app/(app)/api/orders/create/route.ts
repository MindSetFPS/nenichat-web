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

        // Start a transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create the order
            // We need to use the repository but within the transaction context.
            // Since our repository uses a pool, we can't easily inject the client unless we refactor.
            // For now, let's just use the repository methods which commit individually, 
            // OR refactor repository to accept a client.
            // Given the time constraints, let's manually execute the queries here for the transaction.

            const orderQuery = `
        INSERT INTO orders (
          contact_id, total_amount, shipping_cost, shipping_address, status,
          payment_method, amount_paid, refunded_amount, payment_status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
            const orderValues = [
                orderData.contact_id,
                orderData.total_amount,
                orderData.shipping_cost,
                orderData.shipping_address,
                orderData.status,
                orderData.payment_method,
                orderData.amount_paid,
                0, // refunded_amount default
                orderData.payment_status,
                orderData.notes
            ];
            const orderResult = await client.query(orderQuery, orderValues);
            const newOrder = orderResult.rows[0];

            // Create order items
            for (const item of items) {
                const itemQuery = `
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5)
        `;
                const itemValues = [
                    newOrder.id,
                    item.productId,
                    item.quantity,
                    item.unitPrice,
                    item.quantity * item.unitPrice
                ];
                await client.query(itemQuery, itemValues);
            }

            await client.query('COMMIT');
            return NextResponse.json(newOrder);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
