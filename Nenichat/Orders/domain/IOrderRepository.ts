import { IOrder } from './IOrder';
import { IOrderItemWithProduct } from './IOrderItemWithProduct';
import { IOrdersReport } from './IOrdersReport';

export interface IOrderRepository {
    getById(businessId: number, id: number): Promise<IOrder | null>;
    getByOrderNumber(businessId: number, orderNumber: number): Promise<IOrder | null>;
    getAll(businessId: number): Promise<IOrder[]>;
    getByContactId(businessId: number, contactId: number): Promise<IOrder[]>;
    getOrdersByPhone(businessId: number, phoneNumber: string): Promise<IOrder[]>;
    create(businessId: number, order: Omit<IOrder, 'id' | 'business_id' | 'created_at' | 'updated_at'> & { created_at?: Date }, items: Array<{ productId: string; quantity: number; unitPrice: number }>): Promise<IOrder>;
    update(businessId: number, id: number, updates: Partial<IOrder>, items?: Array<{ productId: string; quantity: number; unitPrice: number; totalPrice?: number }>): Promise<IOrder | null>;
    delete(businessId: number, id: number): Promise<boolean>;

    /**
     * A method that takes a date, for example, july 1st, and returns orders created on that day
     */
    getOrdersCountByDate(businessId: number, date: Date): Promise<{ product_name: string; count: number }[]>;

    /**
     * A method that takes the number of days, an returns the number of product units ordered in each day of the interval
     * @param interval number of days
     */
    getProductOrdersByDateInterval(businessId: number, interval: number): Promise<{ date: string; quantity: number }[]>;

    /**
     * Returns the count of orders for each day of the week (1=Monday, 7=Sunday)
     * If contactId is provided, filters by contact. Otherwise returns for all orders.
     */
    getOrdersCountByDayOfWeek(businessId: number, contactId?: number): Promise<{ day_index: number; count: number }[]>;

    /**
     * Returns the total amount of orders per day for a given interval.
     */
    getOrderTotalPerDay(businessId: number, interval: number): Promise<IOrdersReport[]>;

    getItems(businessId: number, orderId: number): Promise<IOrderItemWithProduct[]>;
}
