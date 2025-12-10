export interface IOrder {
    id: number;
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
}
