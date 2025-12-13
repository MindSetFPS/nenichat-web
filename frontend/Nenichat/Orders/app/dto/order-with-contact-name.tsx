import { IOrder } from "../../domain/IOrder";

export type OrderWithContactName = IOrder & {
    contact_name?: string;
}