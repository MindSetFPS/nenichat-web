import { IOrderItem } from "./IOrderItem";

export interface IOrderItemWithProduct extends IOrderItem {
    product_name: string | null;
}
