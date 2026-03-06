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
            parseInt(row.business_id),
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

    async getById(businessId: number, id: number): Promise<IOrder | null> {
        const result = await this.pool.query('SELECT * FROM orders WHERE id = $1 AND business_id = $2', [id, businessId]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToOrder(result.rows[0]);
    }

    async getAll(businessId: number): Promise<IOrder[]> {
        const result = await this.pool.query('SELECT * FROM orders WHERE business_id = $1 ORDER BY created_at DESC', [businessId]);
        return result.rows.map(this.mapRowToOrder);
    }

    async getByContactId(businessId: number, contactId: number): Promise<IOrder[]> {
        const result = await this.pool.query('SELECT * FROM orders WHERE contact_id = $1 AND business_id = $2 ORDER BY created_at DESC', [contactId, businessId]);
        return result.rows.map(this.mapRowToOrder);
    }

    async getOrdersByPhone(businessId: number, phoneNumber: string): Promise<IOrder[]> {
        const query = `
            SELECT o.* FROM orders o
            JOIN contacts c ON o.contact_id = c.id
            WHERE c.phone = $1 AND o.business_id = $2
            ORDER BY o.created_at DESC
        `;
        const result = await this.pool.query(query, [phoneNumber, businessId]);
        return result.rows.map(this.mapRowToOrder);
    }

    async create(businessId: number, orderData: Omit<IOrder, 'id' | 'business_id' | 'created_at' | 'updated_at'> & { created_at?: Date }, items: Array<{ productId: string; quantity: number; unitPrice: number }>): Promise<IOrder> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            const orderQuery = `
              INSERT INTO orders (
                business_id, contact_id, total_amount, shipping_cost, shipping_address, status,
                payment_method, amount_paid, refunded_amount, payment_status, notes,
                completed_at, cancelled_at, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, COALESCE($14, NOW()))
              RETURNING *
            `;
            const orderValues = [
                businessId,
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

    async update(businessId: number, id: number, updates: Partial<IOrder>, items?: Array<{ productId: string; quantity: number; unitPrice: number; totalPrice?: number }>): Promise<IOrder | null> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            const fields = Object.keys(updates)
                .map((key, index) => `"${key}" = $${index + 3}`)
                .join(', ');
            const values = Object.values(updates);

            let updatedOrderRow = null;

            if (fields.length > 0) {
                const query = `UPDATE orders SET ${fields}, updated_at = NOW() WHERE id = $1 AND business_id = $2 RETURNING *`;
                const result = await client.query(query, [id, businessId, ...values]);
                if (result.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return null;
                }
                updatedOrderRow = result.rows[0];
            } else {
                const result = await client.query('SELECT * FROM orders WHERE id = $1 AND business_id = $2', [id, businessId]);
                if (result.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return null;
                }
                updatedOrderRow = result.rows[0];
            }

            if (items && items.length > 0) {
                // Delete existing items - Using order_items as per existing PG repo code
                await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);

                // Recreate all items
                for (const item of items) {
                    const itemQuery = `
                      INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
                      VALUES ($1, $2, $3, $4, $5)
                    `;
                    const itemValues = [
                        id,
                        item.productId,
                        item.quantity,
                        item.unitPrice,
                        item.totalPrice || (item.quantity * item.unitPrice)
                    ];
                    await client.query(itemQuery, itemValues);
                }
            }

            await client.query('COMMIT');
            return this.mapRowToOrder(updatedOrderRow);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getOrderTotalPerDay(businessId: number, interval: number): Promise<IOrdersReport[]> {
        const query = `
            SELECT 
                DATE(created_at) as date,
                SUM(total_amount) as total
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '${interval} days'
            AND business_id = $1
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;
        const result = await this.pool.query(query, [businessId]);
        return result.rows.map(row => ({
            date: row.date,
            total: parseFloat(row.total)
        }));
    }

    async delete(businessId: number, id: number): Promise<boolean> {
        const result = await this.pool.query('DELETE FROM orders WHERE id = $1 AND business_id = $2', [id, businessId]);
        return (result.rowCount || 0) > 0;
    }

    async getOrdersCountByDate(businessId: number, date: Date): Promise<{ product_name: string; count: number }[]> {
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
            WHERE DATE(o.created_at) = $1 AND o.business_id = $2
            GROUP BY oi.product_id, p.name
            ORDER BY count DESC
        `;

        // Format date in local timezone (YYYY-MM-DD) instead of UTC
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const localDateString = `${year}-${month}-${day}`;

        const result = await this.pool.query(query, [localDateString, businessId]);
        return result.rows.map(row => ({
            product_name: row.product_name,
            count: row.count
        }));
    }

    async getProductOrdersByDateInterval(businessId: number, interval: number): Promise<{ date: string; quantity: number }[]> {
        const query = `
            SELECT 
                DATE(o.created_at) as date,
                SUM(oi.quantity) as quantity
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.created_at >= NOW() - INTERVAL '${interval} days'
            AND o.business_id = $1
            GROUP BY DATE(o.created_at)
            ORDER BY date ASC
        `;
        const result = await this.pool.query(query, [businessId]);
        return result.rows.map(row => ({
            date: row.date,
            quantity: Number(row.quantity)
        }));
    }

    async getOrdersCountByDayOfWeek(businessId: number, contactId?: number): Promise<{ day_index: number; count: number }[]> {
        let query = `
            SELECT 
                EXTRACT(ISODOW FROM created_at) as day_index,
                COUNT(*) as count
            FROM orders 
            WHERE business_id = $1
        `;

        const params: any[] = [businessId];

        if (contactId) {
            query += ` AND contact_id = $2 `;
            params.push(contactId);
        }

        query += `
            GROUP BY day_index 
            ORDER BY day_index
        `;

        const result = await this.pool.query(query, params);
        return result.rows.map(row => ({
            day_index: parseInt(row.day_index),
            count: parseInt(row.count)
        }));
    }

    // this seems to be a duplicate of OrderItemRepository.getByOrderIdWithProduct
    async getItems(businessId: number, orderId: number): Promise<IOrderItemWithProduct[]> {
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
            WHERE oi.order_id = $1 AND p.business_id = $2
        `;
        const result = await this.pool.query(query, [orderId, businessId]);
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

