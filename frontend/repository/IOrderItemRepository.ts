import { IOrderItem } from '../dto/IOrderItem';
import { IOrderItemWithProduct } from '../dto/IOrderItemWithProduct';

export interface IOrderItemRepository {
    getById(id: number): Promise<IOrderItem | null>;
    getByOrderId(orderId: number): Promise<IOrderItem[]>;
    getByOrderIdWithProduct(orderId: number): Promise<IOrderItemWithProduct[]>;
    create(item: Omit<IOrderItem, 'id'>): Promise<IOrderItem>;
    update(id: number, updates: Partial<IOrderItem>): Promise<IOrderItem | null>;
    delete(id: number): Promise<boolean>;
}
