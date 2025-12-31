import { NextResponse } from 'next/server';
import { audienceRepository } from '@/Nenichat/Audiences/infra/persistance/AudienceRepository';
import { audienceContactRepository } from '@/Nenichat/Audiences/infra/persistance/AudienceContactRepository';

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // note: this should be a single transaction so that
    // if one fails, i can rollback 
    // but im a noob so we do it later

    try {
      await audienceContactRepository.delete(id);
      await audienceRepository.delete(Number(id));
    } catch (error) {
      console.error('Error deleting audience:', error);
      return NextResponse.json(
        { message: 'Error deleting audience' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Audience deleted successfully' });
  } catch (error) {
    console.error('Error deleting audience:', error);
    return NextResponse.json(
      { message: 'Error deleting audience' },
      { status: 500 }
    );
  }
}
