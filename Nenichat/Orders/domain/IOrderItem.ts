export interface IOrderItem {
    id: number;
    order_id: number;
    product_id: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
}
