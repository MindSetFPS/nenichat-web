import { NextResponse } from 'next/server';
import { audienceContactRepository } from '@/repository/AudienceContactRepository';
import { contactRepository } from '@/Nenichat/Contacts/infra/persistance/ContactRepository';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    const audienceMembers = await audienceContactRepository.findByAudienceId(id);
    const allContacts = await contactRepository.list(0, 1000);

    return NextResponse.json({ audienceMembers, allContacts });
  } catch (error) {
    console.error('Error fetching audience members:', error);
    return NextResponse.json(
      { message: 'Error fetching audience members' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const { contactIds } = await request.json();

    if (!Array.isArray(contactIds)) {
      return NextResponse.json(
        { message: 'Invalid request body: contactIds must be an array' },
        { status: 400 }
      );
    }

    await audienceContactRepository.updateAudienceMembers(id, contactIds);

    return NextResponse.json({ message: 'Audience members updated successfully' });
  } catch (error) {
    console.error('Error updating audience members:', error);
    return NextResponse.json(
      { message: 'Error updating audience members' },
      { status: 500 }
    );
  }
}
