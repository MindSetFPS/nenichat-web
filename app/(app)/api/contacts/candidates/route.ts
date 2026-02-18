import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseContactRepository } from '@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository';
import { getBusinessFromUser } from '@/lib/user-auth';

/**
 * @swagger
 * /api/contacts/candidates:
 *   get:
 *     summary: Get contacts that are candidates for merging
 */
export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  const contactRepository = new SupabaseContactRepository(supabase);

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    const { contacts, total } = await contactRepository.findMergeCandidates(business.id, offset, limit);

    return NextResponse.json({
      data: contacts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching merge candidates:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
