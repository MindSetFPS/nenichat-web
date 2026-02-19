import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseAudienceContactRepository } from '@/Nenichat/Audiences/infra/persistance/SupabaseAudienceContactRepository';
import { getBusinessFromUser } from '@/lib/user-auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const audienceContactRepository = new SupabaseAudienceContactRepository(supabase);

    try {
        const id = parseInt((await params).id, 10);
        const availableMembers = await audienceContactRepository.findAvailableContacts(business.id, id);
        return NextResponse.json(availableMembers);
    } catch (error: any) {
        console.error('Error fetching available audience members:', error);
        return NextResponse.json(
            { message: 'Error fetching available audience members', details: error.message },
            { status: 500 }
        );
    }
}
