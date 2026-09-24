import { IOrder } from "../domain/IOrder";

type OrderStatus = IOrder["status"];

/** Canonical status order for selects and breakdowns. */
export const ORDER_STATUSES: OrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    pending: "Pendiente",
    processing: "Procesando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
};

/** Plural forms for count lists ("3 Pendientes"). */
export const ORDER_STATUS_PLURAL_LABELS: Record<OrderStatus, string> = {
    pending: "Pendientes",
    processing: "Procesando",
    shipped: "Enviados",
    delivered: "Entregados",
    cancelled: "Cancelados",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transferencia",
    other: "Otro",
};
