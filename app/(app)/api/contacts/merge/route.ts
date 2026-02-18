import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseContactRepository } from '@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository';
import { getBusinessFromUser } from '@/lib/user-auth';

/**
 * @swagger
 * /api/contacts/merge:
 *   post:
 *     summary: Merge multiple contacts into a primary contact
 */
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  const contactRepository = new SupabaseContactRepository(supabase);

  try {
    const { primaryContactId, secondaryContactIds } = await request.json();

    if (!primaryContactId || !secondaryContactIds || !Array.isArray(secondaryContactIds) || secondaryContactIds.length === 0) {
      return NextResponse.json({ message: 'Invalid request body. primaryContactId and secondaryContactIds (array) are required.' }, { status: 400 });
    }

    const primaryId = Number(primaryContactId);
    const secondaryIds = secondaryContactIds.map((id: string) => Number(id));

    // Verify all contacts belong to this business
    const primaryContact = await contactRepository.findById(business.id, primaryId);
    if (!primaryContact) {
      return NextResponse.json({ message: 'Primary contact not found or unauthorized' }, { status: 404 });
    }

    await contactRepository.mergeContacts(business.id, primaryId, secondaryIds);

    return NextResponse.json({ message: 'Contacts merged successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error merging contacts:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
