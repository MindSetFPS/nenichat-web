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

            if (jidKind === 'contact') {
                let searchNumber = orderData.lid;
                if (orderData.lid.includes(':')) {
                    searchNumber = orderData.lid.split(':')[0];
                }

                // Use the new join-based query for phone numbers
                const { data: contact, error: contactError } = await supabase
                    .from('contacts')
                    .select('id, phone_numbers!inner(phone_number)')
                    .eq('business_id', business.id)
                    .ilike('phone_numbers.phone_number', `%${searchNumber}%`)
                    .maybeSingle();

                if (contactError) {
                    console.error("Error finding contact by phone: ", contactError);
                    return NextResponse.json({ error: 'Failed to find contact' }, { status: 500 });
                }
                if (contact) {
                    contactId = contact.id;
                }
            } else {
                // For 'lid'
                const { data: contact, error: contactError } = await supabase
                    .from('contacts')
                    .select('id')
                    .eq('business_id', business.id)
                    .eq('lid', orderData.lid)
                    .maybeSingle();

                if (contactError) {
                    console.error("Error finding contact by lid: ", contactError);
                    return NextResponse.json({ error: 'Failed to find contact' }, { status: 500 });
                }
                if (contact) {
                    contactId = contact.id;
                }
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

