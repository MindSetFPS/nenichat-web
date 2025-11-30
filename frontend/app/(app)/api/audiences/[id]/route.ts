import { NextResponse } from 'next/server';
import { audienceRepository } from '@/Nenichat/Audiences/infra/persistance/AudienceRepository';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const audience = await audienceRepository.findById(Number(id));

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