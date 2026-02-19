import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseAudienceRepository } from '@/Nenichat/Audiences/infra/persistance/SupabaseAudienceRepository';
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

  const audienceRepository = new SupabaseAudienceRepository(supabase);

  try {
    const { id } = await params;
    const audience = await audienceRepository.findById(business.id, Number(id));

    if (!audience) {
      return NextResponse.json(
        { message: 'Audience not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(audience);
  } catch (error) {
    console.error('Error fetching audience details:', error);
    return NextResponse.json(
      { message: 'Error fetching audience details' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  const audienceRepository = new SupabaseAudienceRepository(supabase);
  const audienceContactRepository = new SupabaseAudienceContactRepository(supabase);

  try {
    const { id } = await params;
    const audienceId = Number(id);

    // Verify ownership before delete (repository already does this but double check)
    const audience = await audienceRepository.findById(business.id, audienceId);
    if (!audience) {
      return NextResponse.json({ message: 'Audience not found or unauthorized' }, { status: 404 });
    }

    await audienceContactRepository.delete(business.id, audienceId);
    await audienceRepository.delete(business.id, audienceId);

    return NextResponse.json({ message: 'Audience deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting audience:', error);
    return NextResponse.json(
      { message: 'Error deleting audience', details: error.message },
      { status: 500 }
    );
  }
}
