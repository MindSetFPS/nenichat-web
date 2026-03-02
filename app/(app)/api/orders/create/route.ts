import { NextResponse } from 'next/server';
import { SupabaseOrderRepository } from '@/Nenichat/Orders/infra/persistance/SupabaseOrderRepository';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';
import { getJidKind } from '@/Nenichat/Chats/domain/Jid';

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

        console.log("request body: ", body)


        let contactId = orderData.contact_id;

        // Resolve contactId from lid if not provided
        if (!contactId && orderData.lid) {
            const jidKind = getJidKind(orderData.lid);
            const query = supabase
                .from('contacts')
                .select('id')
                .eq('business_id', business.id);

            // If it's a known contact (phone_number), search by that column.
            // Otherwise, search by the lid column.
            // Recently we received an already saved contact with a number formatted differently 
            // than usual, so we had to adapt the code to find it.
            // So numbers can be:
            // xxxxxxxxxx@s.whatsapp.net
            // xxxxxxxxxx:yy@s.whatsapp.net
            // xxxxxxxxxx
            if (jidKind === 'contact') {
                let searchNumber = orderData.lid;
                if (orderData.lid.includes(':')) {
                    searchNumber = orderData.lid.split(':')[0];
                }
                query.ilike('phone_number', `%${searchNumber}%`);
            } else {
                // For 'lid' or fallback
                query.eq('lid', orderData.lid);
            }

            const { data: contact, error: contactError } = await query.maybeSingle();

            if (contactError) {
                console.error("Error finding contact: ", contactError)
                return NextResponse.json({ error: 'Failed to find contact' }, { status: 500 });
            }
            if (contact) {
                contactId = contact.id;
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

