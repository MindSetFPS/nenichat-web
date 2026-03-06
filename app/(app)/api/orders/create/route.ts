import { NextResponse } from 'next/server';
import { SupabaseOrderRepository } from '@/Nenichat/Orders/infra/persistance/SupabaseOrderRepository';
import { SupabaseContactRepository } from '@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';

export async function POST(request: Request) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const orderRepository = new SupabaseOrderRepository(supabase);
    const contactRepository = new SupabaseContactRepository(supabase);

    try {
        const body = await request.json();
        const { items, ...orderData } = body;

        console.log("request body: ", body)


        let contactId = orderData.contact_id;

        // Resolve contactId from lid if not provided
        if (!contactId && orderData.lid) {
            try {
                const contact = await contactRepository.getOrCreateContact(business.id, orderData.lid);
                contactId = contact.id;
            } catch (err) {
                console.error("Error resolving contact during order creation:", err);
                return NextResponse.json({ error: 'Failed to resolve contact' }, { status: 500 });
            }
        }

        if (!contactId) {
            return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
        }

        const newOrder = await orderRepository.create(business.id, {
            ...orderData,
            contact_id: contactId,
            refunded_amount: 0 // Default value
        }, items);

        return NextResponse.json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

