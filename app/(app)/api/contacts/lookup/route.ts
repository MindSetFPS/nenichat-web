import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseContactRepository } from '@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository';
import { getBusinessFromUser } from '@/lib/user-auth';

export async function GET(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const contactRepository = new SupabaseContactRepository(supabase);

    try {
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');
        const lid = searchParams.get('lid');

        if (!phone && !lid) {
            return NextResponse.json(
                { error: 'Either phone or lid parameter is required' },
                { status: 400 }
            );
        }

        const phoneOrLid = lid || phone;
        const contact = await contactRepository.findByPhoneNumberOrLid(business.id, phoneOrLid!);

        return NextResponse.json(contact);
    } catch (error: any) {
        console.error('Error fetching contact:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contact', details: error.message },
            { status: 500 }
        );
    }
}
