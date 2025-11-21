import { Pool } from 'pg';
import { IOrder } from '../dto/IOrder';
import { IOrderRepository } from './IOrderRepository';
import { Order } from './Order';

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

    async create(order: Omit<IOrder, 'id' | 'created_at' | 'updated_at'>): Promise<IOrder> {
        const query = `
      INSERT INTO orders (
        contact_id, total_amount, shipping_cost, shipping_address, status,
        payment_method, amount_paid, refunded_amount, payment_status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
        const values = [
            order.contact_id,
            order.total_amount,
            order.shipping_cost,
            order.shipping_address,
            order.status,
            order.payment_method,
            order.amount_paid,
            order.refunded_amount,
            order.payment_status,
            order.notes
        ];
        const result = await this.pool.query(query, values);
        return this.mapRowToOrder(result.rows[0]);
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

    async delete(id: number): Promise<boolean> {
        const result = await this.pool.query('DELETE FROM orders WHERE id = $1', [id]);
        return (result.rowCount || 0) > 0;
    }
}
