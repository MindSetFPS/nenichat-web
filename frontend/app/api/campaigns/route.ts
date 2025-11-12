
import { NextResponse } from 'next/server'
import { campaignRepository } from '@/repository/CampaignRepository';
import { ICampaign } from '@/dto/ICampaign';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, run_at } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const campaign = await campaignRepository.create({
      name,
      description,
      run_at,
    } as Partial<ICampaign>);

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
