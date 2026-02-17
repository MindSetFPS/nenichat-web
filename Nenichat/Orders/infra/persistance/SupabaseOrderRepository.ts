import { supabase as importedSupabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { IOrder } from "../../domain/IOrder";
import { IOrderRepository } from "../../domain/IOrderRepository";
import { IOrderItemWithProduct } from "../../domain/IOrderItemWithProduct";
import { IOrdersReport } from "../../domain/IOrdersReport";
import { Order } from "../../domain/Order";

/**
 * Implementation of IOrderRepository using Supabase.
 */
export class SupabaseOrderRepository implements IOrderRepository {
    private _supabase: SupabaseClient;

    constructor(supabase?: SupabaseClient) {
        if (supabase) {
            this._supabase = supabase;
        } else {
            // Fallback to the imported singleton if no client is provided
            this._supabase = importedSupabase;
        }
    }

    get supabase(): SupabaseClient {
        return this._supabase;
    }

    /**
     * Maps a database row to an Order domain object.
     * @param data The database row data
     * @returns A new Order instance
     */
    private mapToOrder(data: any): Order {
        return new Order(
            data.id,
            data.business_id,
            data.contact_id,
            parseFloat(data.total_amount),
            parseFloat(data.shipping_cost),
            data.shipping_address,
            data.status,
            data.payment_method,
            parseFloat(data.amount_paid),
            parseFloat(data.refunded_amount),
            data.payment_status,
            data.notes,
            data.completed_at ? new Date(data.completed_at) : null,
            data.cancelled_at ? new Date(data.cancelled_at) : null,
            new Date(data.created_at),
            new Date(data.updated_at)
        );
    }

    /**
     * Retrieves an order by its ID.
     */
    async getById(id: number): Promise<IOrder | null> {
        const { data, error } = await this.supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error("Error fetching order by ID:", error);
            throw error;
        }
        return this.mapToOrder(data);
    }

    /**
     * Retrieves all orders, ordered by creation date descending.
     */
    async getAll(): Promise<IOrder[]> {
        const { data, error } = await this.supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching all orders:", error);
            throw error;
        }
        return (data || []).map(row => this.mapToOrder(row));
    }

    /**
     * Retrieves all orders for a specific contact.
     */
    async getByContactId(contactId: number): Promise<IOrder[]> {
        const { data, error } = await this.supabase
            .from('orders')
            .select('*')
            .eq('contact_id', contactId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching orders by contact ID:", error);
            throw error;
        }
        return (data || []).map(row => this.mapToOrder(row));
    }

    /**
     * Creates a new order and its associated items.
     * Note: This implementation is not atomic because it uses the client-side library.
     * For full atomicity, a PostgreSQL function (RPC) should be used.
     */
    async create(
        orderData: Omit<IOrder, 'id' | 'created_at' | 'updated_at'> & { created_at?: Date },
        items: Array<{ productId: string; quantity: number; unitPrice: number }>
    ): Promise<IOrder> {
        const { data: newOrder, error: orderError } = await this.supabase
            .from('orders')
            .insert({
                business_id: orderData.business_id,
                contact_id: orderData.contact_id,
                total_amount: orderData.total_amount,
                shipping_cost: orderData.shipping_cost,
                shipping_address: orderData.shipping_address,
                status: orderData.status,
                payment_method: orderData.payment_method,
                amount_paid: orderData.amount_paid,
                refunded_amount: orderData.refunded_amount,
                payment_status: orderData.payment_status,
                notes: orderData.notes,
                completed_at: orderData.completed_at,
                cancelled_at: orderData.cancelled_at,
                created_at: orderData.created_at ? orderData.created_at.toISOString() : new Date().toISOString()
            })
            .select()
            .single();

        if (orderError) {
            console.error("Error creating order:", orderError);
            throw orderError;
        }

        const orderItems = items.map(item => ({
            order_id: newOrder.id,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.quantity * item.unitPrice
        }));

        const { error: itemsError } = await this.supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error("Error creating order items for order:", newOrder.id, itemsError);
            // Ideally we'd rollback here, but we'd need an RPC.
            throw itemsError;
        }

        return this.mapToOrder(newOrder);
    }

    /**
     * Updates an existing order.
     */
    async update(id: number, updates: Partial<IOrder>): Promise<IOrder | null> {
        const { data, error } = await this.supabase
            .from('orders')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error("Error updating order:", error);
            throw error;
        }
        return this.mapToOrder(data);
    }

    /**
     * Deletes an order by its ID.
     */
    async delete(id: number): Promise<boolean> {
        const { error } = await this.supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting order:", error);
            throw error;
        }
        return true;
    }

    /**
     * Aggregates the number of products ordered on a specific date.
     */
    async getOrdersCountByDate(date: Date): Promise<{ product_name: string; count: number }[]> {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const localDateString = `${year}-${month}-${day}`;

        // Fetch orders and their items with product names
        const { data, error } = await this.supabase
            .from('orders')
            .select(`
                id,
                created_at,
                order_items (
                    quantity,
                    products (
                        name
                    )
                )
            `)
            .gte('created_at', `${localDateString}T00:00:00`)
            .lte('created_at', `${localDateString}T23:59:59`);

        if (error) {
            console.error("Error fetching orders count by date:", error);
            throw error;
        }

        const aggregation: Record<string, number> = {};
        data?.forEach((order: any) => {
            order.order_items?.forEach((item: any) => {
                const name = item.products?.name || 'Unknown Product';
                aggregation[name] = (aggregation[name] || 0) + Number(item.quantity);
            });
        });

        return Object.entries(aggregation)
            .map(([product_name, count]) => ({ product_name, count }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * Gets the total quantity of products ordered per day over a given interval.
     */
    async getProductOrdersByDateInterval(interval: number): Promise<{ date: string; quantity: number }[]> {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - interval);

        const { data, error } = await this.supabase
            .from('orders')
            .select(`
                created_at,
                order_items (
                    quantity
                )
            `)
            .gte('created_at', dateLimit.toISOString());

        if (error) {
            console.error("Error fetching product orders by interval:", error);
            throw error;
        }

        const aggregation: Record<string, number> = {};
        data?.forEach((order: any) => {
            const dateStr = new Date(order.created_at).toISOString().split('T')[0];
            const quantity = order.order_items?.reduce((sum: number, item: any) => sum + Number(item.quantity), 0) || 0;
            aggregation[dateStr] = (aggregation[dateStr] || 0) + quantity;
        });

        return Object.entries(aggregation)
            .map(([date, quantity]) => ({ date, quantity }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * Returns the count of orders for each day of the week.
     */
    async getOrdersCountByDayOfWeek(contactId?: number): Promise<{ day_index: number; count: number }[]> {
        let query = this.supabase
            .from('orders')
            .select('created_at');

        if (contactId) {
            query = query.eq('contact_id', contactId);
        }

        const { data, error } = await query;
        if (error) {
            console.error("Error fetching orders count by day of week:", error);
            throw error;
        }

        const counts: Record<number, number> = {};
        // Initialize counts for 1-7 (Mon-Sun)
        for (let i = 1; i <= 7; i++) {
            counts[i] = 0;
        }

        data?.forEach((order: any) => {
            const date = new Date(order.created_at);
            // JS getDay() is 0=Sun, 1=Mon...
            // We want 1=Mon, 7=Sun
            let dayIndex = date.getDay();
            if (dayIndex === 0) {
                dayIndex = 7;
            }
            counts[dayIndex]++;
        });

        return Object.entries(counts)
            .map(([day_index, count]) => ({
                day_index: Number(day_index),
                count
            }))
            .sort((a, b) => a.day_index - b.day_index);
    }

    /**
     * Returns the total amount of orders per day for a given interval.
     */
    async getOrderTotalPerDay(interval: number): Promise<IOrdersReport[]> {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - interval);

        const { data, error } = await this.supabase
            .from('orders')
            .select('created_at, total_amount')
            .gte('created_at', dateLimit.toISOString())
            .order('created_at', { ascending: true });

        if (error) {
            console.error("Error fetching order total per day:", error);
            throw error;
        }

        const aggregation: Record<string, number> = {};
        data?.forEach((order: any) => {
            const dateStr = new Date(order.created_at).toISOString().split('T')[0];
            aggregation[dateStr] = (aggregation[dateStr] || 0) + parseFloat(order.total_amount);
        });

        return Object.entries(aggregation)
            .map(([date, total]) => ({
                date,
                total
            }));
    }

    /**
     * Retrieves all items for an order, including the product name.
     */
    async getItems(orderId: number): Promise<IOrderItemWithProduct[]> {
        const { data, error } = await this.supabase
            .from('order_items')
            .select(`
                id,
                order_id,
                product_id,
                quantity,
                unit_price,
                total_price,
                products (
                    name
                )
            `)
            .eq('order_id', orderId);

        if (error) {
            console.error("Error fetching order items:", error);
            throw error;
        }

        return (data || []).map((row: any) => ({
            id: row.id,
            order_id: row.order_id,
            product_id: row.product_id,
            quantity: Number(row.quantity),
            unit_price: Number(row.unit_price),
            total_price: Number(row.total_price),
            product_name: row.products?.name || null
        }));
    }
}
