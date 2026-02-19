import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseCampaignRepository } from '@/Nenichat/Campaigns/infra/persistance/SupabaseCampaignRepository';
import { getBusinessFromUser } from '@/lib/user-auth';
import { ICampaign } from '@/Nenichat/Campaigns/domain/ICampaign';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  const campaignRepository = new SupabaseCampaignRepository(supabase);

  try {
    const { id } = await params;
    const campaign = await campaignRepository.findById(business.id, id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    return NextResponse.json(campaign);
  } catch (error: any) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  const campaignRepository = new SupabaseCampaignRepository(supabase);

  try {
    const { id } = await params;
    const body: Partial<ICampaign> = await request.json();

    const campaignToUpdate: Partial<ICampaign> = {
      id: Number(id),
      ...body
    };

    const updatedCampaign = await campaignRepository.update(business.id, campaignToUpdate);

    return NextResponse.json(updatedCampaign);
  } catch (error: any) {
    console.error("Error updating campaign:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
