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
    const audienceMembers = await audienceContactRepository.findByAudienceId(business.id, id);
    return NextResponse.json(audienceMembers);
  } catch (error: any) {
    console.error('Error fetching audience members:', error);
    return NextResponse.json(
      { message: 'Error fetching audience members', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const contactIds = await request.json() as { contactIds: { [key: string]: boolean } };

    if (Object.values(contactIds).some((value) => !value)) {
      return NextResponse.json(
        { message: 'Invalid request body: contactIds must be an object with boolean values' },
        { status: 400 }
      );
    }

    // convert contactIds to array of numbers
    const contactIdsArray: number[] = Object.keys(contactIds.contactIds).map(Number);

    await audienceContactRepository.updateAudienceMembers(business.id, id, contactIdsArray);

    return NextResponse.json({ message: 'Audience members updated successfully' });
  } catch (error: any) {
    console.error('Error updating audience members:', error);
    return NextResponse.json(
      { message: 'Error updating audience members', details: error.message },
      { status: 500 }
    );
  }
}
