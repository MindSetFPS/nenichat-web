import { NextResponse } from 'next/server';
import { SupabaseOrderRepository } from '@/Nenichat/Orders/infra/persistance/SupabaseOrderRepository';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';

export async function POST(request: Request) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const orderRepository = new SupabaseOrderRepository(supabase);

    try {
        const body = await request.json();
        const { items, ...orderData } = body;

        const newOrder = await orderRepository.create(business.id, {
            ...orderData,
            refunded_amount: 0 // Default value
        }, items);

        return NextResponse.json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

