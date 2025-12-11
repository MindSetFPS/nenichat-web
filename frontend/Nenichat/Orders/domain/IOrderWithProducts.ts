// An interface a represents an order with all of its products and details.

import { IOrder } from "./IOrder";
import { IOrderItemWithProduct } from "./IOrderItemWithProduct";

export interface IOrderWithProducts extends IOrder {
    items: IOrderItemWithProduct[];
}