import { IOrder } from './IOrder';

export interface IOrderRepository {
    getById(id: number): Promise<IOrder | null>;
    getAll(): Promise<IOrder[]>;
    getByContactId(contactId: number): Promise<IOrder[]>;
    create(order: Omit<IOrder, 'id' | 'created_at' | 'updated_at'> & { created_at?: Date }, items: Array<{ productId: string; quantity: number; unitPrice: number }>): Promise<IOrder>;
    update(id: number, updates: Partial<IOrder>): Promise<IOrder | null>;
    delete(id: number): Promise<boolean>;
}
