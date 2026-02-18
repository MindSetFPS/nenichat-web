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
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const contacts = await contactRepository.search(business.id, query, 10); // Fixed argument order
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error searching contacts:', error);
    return NextResponse.json({ error: 'Failed to search contacts' }, { status: 500 });
  }
}
