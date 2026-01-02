import { Pool } from 'pg';
import { IOrder } from '../../domain/IOrder';
import { IOrderRepository } from '../../domain/IOrderRepository';
import { Order } from '../../domain/Order';
import { IOrdersReport } from '../../domain/IOrdersReport';
import { IOrderWithProducts } from '../../domain/IOrderWithProducts';
import { IOrderItemWithProduct } from '../../domain/IOrderItemWithProduct';

export class OrderRepository implements IOrderRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    private mapRowToOrder(row: any): Order {
        return new Order(
            parseInt(row.id),
            row.contact_id ? parseInt(row.contact_id) : null,
            parseFloat(row.total_amount),
            parseFloat(row.shipping_cost),
            row.shipping_address,
            row.status,
            row.payment_method,
            parseFloat(row.amount_paid),
            parseFloat(row.refunded_amount),
            row.payment_status,
            row.notes,
            row.completed_at,
            row.cancelled_at,
            row.created_at,
            row.updated_at
        );
    }

    async getById(id: number): Promise<IOrder | null> {
        const result = await this.pool.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToOrder(result.rows[0]);
    }

    async getAll(): Promise<IOrder[]> {
        const result = await this.pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        return result.rows.map(this.mapRowToOrder);
    }

    async getByContactId(contactId: number): Promise<IOrder[]> {
        const result = await this.pool.query('SELECT * FROM orders WHERE contact_id = $1 ORDER BY created_at DESC', [contactId]);
        return result.rows.map(this.mapRowToOrder);
    }

    async create(orderData: Omit<IOrder, 'id' | 'created_at' | 'updated_at'> & { created_at?: Date }, items: Array<{ productId: string; quantity: number; unitPrice: number }>): Promise<IOrder> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            const orderQuery = `
              INSERT INTO orders (
                contact_id, total_amount, shipping_cost, shipping_address, status,
                payment_method, amount_paid, refunded_amount, payment_status, notes,
                completed_at, cancelled_at, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, COALESCE($13, NOW()))
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
                orderData.refunded_amount,
                orderData.payment_status,
                orderData.notes,
                orderData.completed_at,
                orderData.cancelled_at,
                orderData.created_at
            ];
            const orderResult = await client.query(orderQuery, orderValues);
            const newOrder = orderResult.rows[0];

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
            return this.mapRowToOrder(newOrder);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async update(id: number, updates: Partial<IOrder>): Promise<IOrder | null> {
        const fields = Object.keys(updates)
            .map((key, index) => `"${key}" = $${index + 2}`)
            .join(', ');
        const values = Object.values(updates);

        if (fields.length === 0) {
            return this.getById(id);
        }

        const query = `UPDATE orders SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`;
        const result = await this.pool.query(query, [id, ...values]);

        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToOrder(result.rows[0]);
    }

    async getOrderTotalPerDay(interval: number): Promise<IOrdersReport[]> {
        const query = `
            SELECT 
                DATE(created_at) as date,
                SUM(total_amount) as total
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '${interval} days'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;
        const result = await this.pool.query(query);
        return result.rows.map(row => ({
            date: row.date,
            total: parseFloat(row.total)
        }));
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.pool.query('DELETE FROM orders WHERE id = $1', [id]);
        return (result.rowCount || 0) > 0;
    }

    async getOrdersCountByDate(date: Date): Promise<{ product_name: string; count: number }[]> {
        //  A method that takes a date, for example, july 1st, and returns the count of orders of each product on that day
        // to get the product name, we also need to join the products table

        // instead of counting the orders, we should sum the quantity of each product
        const query = `
            SELECT 
                oi.product_id,
                p.name as product_name,
                SUM(oi.quantity) as count
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE DATE(o.created_at) = $1
            GROUP BY oi.product_id, p.name
            ORDER BY count DESC
        `;

        // Format date in local timezone (YYYY-MM-DD) instead of UTC
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const localDateString = `${year}-${month}-${day}`;

        const result = await this.pool.query(query, [localDateString]);
        return result.rows.map(row => ({
            product_name: row.product_name,
            count: row.count
        }));
    }

    async getProductOrdersByDateInterval(interval: number): Promise<{ date: string; quantity: number }[]> {
        const query = `
            SELECT 
                DATE(o.created_at) as date,
                SUM(oi.quantity) as quantity
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.created_at >= NOW() - INTERVAL '${interval} days'
            GROUP BY DATE(o.created_at)
            ORDER BY date ASC
        `;
        const result = await this.pool.query(query);
        return result.rows.map(row => ({
            date: row.date,
            quantity: Number(row.quantity)
        }));
    }

    // this seems to be a duplicate of OrderItemRepository.getByOrderIdWithProduct
    async getItems(orderId: number): Promise<IOrderItemWithProduct[]> {
        const query = `
            SELECT 
                oi.id,
                oi.order_id,
                oi.product_id,
                oi.quantity,
                oi.unit_price,
                oi.total_price,
                p.name as product_name
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1
        `;
        const result = await this.pool.query(query, [orderId]);
        return result.rows.map(row => ({
            id: parseInt(row.id),
            order_id: parseInt(row.order_id),
            product_id: row.product_id,
            quantity: parseFloat(row.quantity),
            unit_price: parseFloat(row.unit_price),
            total_price: parseFloat(row.total_price),
            product_name: row.product_name
        }));
    }
}

