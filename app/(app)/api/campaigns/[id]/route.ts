import { NextResponse } from 'next/server';
import { campaignRepository } from '@/Nenichat/Campaigns/infra/persistance/CampaignRepository';
import { ICampaign } from '@/Nenichat/Campaigns/domain/ICampaign';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await campaignRepository.findById(id, true);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    return NextResponse.json(campaign);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Partial<ICampaign> = await request.json();

    const campaignToUpdate: Partial<ICampaign> = {
      id: Number(id),
      ...body
    };

    const updatedCampaign = await campaignRepository.update(campaignToUpdate);

    return NextResponse.json(updatedCampaign);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
