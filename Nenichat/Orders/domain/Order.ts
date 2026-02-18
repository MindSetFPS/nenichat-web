import { IOrder } from './IOrder';

export class Order implements IOrder {
    id: number;
    business_id: number;
    contact_id: number | null;
    total_amount: number;
    shipping_cost: number;
    shipping_address: string | null;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_method: string | null;
    amount_paid: number;
    refunded_amount: number;
    payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
    notes: string | null;
    completed_at: Date | null;
    cancelled_at: Date | null;
    created_at: Date;
    updated_at: Date;

    constructor(
        id: number,
        business_id: number,
        contact_id: number | null,
        total_amount: number,
        shipping_cost: number,
        shipping_address: string | null,
        status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
        payment_method: string | null,
        amount_paid: number,
        refunded_amount: number,
        payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded',
        notes: string | null,
        completed_at: Date | null,
        cancelled_at: Date | null,
        created_at: Date,
        updated_at: Date
    ) {
        this.id = id;
        this.business_id = business_id;
        this.contact_id = contact_id;
        this.total_amount = total_amount;
        this.shipping_cost = shipping_cost;
        this.shipping_address = shipping_address;
        this.status = status;
        this.payment_method = payment_method;
        this.amount_paid = amount_paid;
        this.refunded_amount = refunded_amount;
        this.payment_status = payment_status;
        this.notes = notes;
        this.completed_at = completed_at;
        this.cancelled_at = cancelled_at;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
