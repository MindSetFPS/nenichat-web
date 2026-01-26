import { IOrder } from "../../domain/IOrder";
import { IOrderItemWithProduct } from "../../domain/IOrderItemWithProduct";

export type OrderWithContactName = IOrder & {
    contact_name?: string;
    items?: IOrderItemWithProduct[];
}