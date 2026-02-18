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
        const page = Number(searchParams.get('page')) || 1;
        const pageSize = Number(searchParams.get('pageSize')) || 10;
        const offset = (page - 1) * pageSize;

        const contacts = await contactRepository.list(business.id, offset, pageSize);
        const total = await contactRepository.count(business.id);

        return NextResponse.json({
            data: contacts,
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error: any) {
        console.error('Error fetching contacts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch contacts', details: error.message },
            { status: 500 }
        );
    }
}