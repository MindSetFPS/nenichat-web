
import { NextResponse } from 'next/server'
import { campaignRepository } from '@/Nenichat/Campaigns/infra/persistance/CampaignRepository';
import { ICampaign } from '@/Nenichat/Campaigns/domain/ICampaign';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, run_at, audienceIds, message } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const campaign = await campaignRepository.create({
      name,
      description,
      run_at,
      audienceIds,
      message,
    } as Partial<ICampaign>);

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
