import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseContactRepository } from '@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository';
import { getBusinessFromUser } from '@/lib/user-auth';

export async function POST(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const contactRepository = new SupabaseContactRepository(supabase);

    try {
        const body = await request.json();
        const { lookups } = body as {
            lookups: { value: string; is_lid: boolean }[];
        };

        if (!lookups || !Array.isArray(lookups)) {
            return NextResponse.json(
                { error: 'lookups array is required' },
                { status: 400 }
            );
        }

        const contacts = await contactRepository.findBatchByPhoneOrLid(business.id, lookups);

        return NextResponse.json(contacts);
    } catch (error: any) {
        console.error('Error fetching contacts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contacts', details: error.message },
            { status: 500 }
        );
    }
}
