import { IOrderItem } from '../dto/IOrderItem';

export class OrderItem implements IOrderItem {
    id: number;
    order_id: number;
    product_id: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;

    constructor(
        id: number,
        order_id: number,
        product_id: string | null,
        quantity: number,
        unit_price: number,
        total_price: number
    ) {
        this.id = id;
        this.order_id = order_id;
        this.product_id = product_id;
        this.quantity = quantity;
        this.unit_price = unit_price;
        this.total_price = total_price;
    }
}
