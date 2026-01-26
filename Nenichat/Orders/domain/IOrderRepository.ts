import { IOrder } from './IOrder';
import { IOrderItemWithProduct } from './IOrderItemWithProduct';

export interface IOrderRepository {
    getById(id: number): Promise<IOrder | null>;
    getAll(): Promise<IOrder[]>;
    getByContactId(contactId: number): Promise<IOrder[]>;
    create(order: Omit<IOrder, 'id' | 'created_at' | 'updated_at'> & { created_at?: Date }, items: Array<{ productId: string; quantity: number; unitPrice: number }>): Promise<IOrder>;
    update(id: number, updates: Partial<IOrder>): Promise<IOrder | null>;
    delete(id: number): Promise<boolean>;

    /**
     * A method that takes a date, for example, july 1st, and returns orders created on that day
     */
    getOrdersCountByDate(date: Date): Promise<{ product_name: string; count: number }[]>;

    /**
     * A method that takes the number of days, an returns the number of product units ordered in each day of the interval
     * @param interval number of days
     */
    getProductOrdersByDateInterval(interval: number): Promise<{ date: string; quantity: number }[]>;

    /**
     * Returns the count of orders for each day of the week (1=Monday, 7=Sunday)
     * If contactId is provided, filters by contact. Otherwise returns for all orders.
     */
    getOrdersCountByDayOfWeek(contactId?: number): Promise<{ day_index: number; count: number }[]>;

    getItems(orderId: number): Promise<IOrderItemWithProduct[]>;
}
