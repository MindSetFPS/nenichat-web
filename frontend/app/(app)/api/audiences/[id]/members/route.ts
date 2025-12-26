import { NextResponse } from 'next/server';
import { audienceContactRepository } from '@/Nenichat/Audiences/infra/persistance/AudienceContactRepository';
import { contactRepository } from '@/Nenichat/Contacts/infra/persistance/ContactRepository';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    const audienceMembers = await audienceContactRepository.findByAudienceId(id);
    // const allContacts = await contactRepository.list(0, 1000);
    console.log('Audience members: ', audienceMembers);
    return NextResponse.json(audienceMembers);
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

    const contactIds = await request.json() as { contactIds: { [key: string]: boolean } };

    if (Object.values(contactIds).some((value) => !value)) {
      return NextResponse.json(
        { message: 'Invalid request body: contactIds must be an object with boolean values' },
        { status: 400 }
      );
    }

    // convert contactIds to array of strings: ['1', '2', '3', '4', '162', '351']
    const contactIdsArray: string[] = Object.keys(contactIds.contactIds);

    await audienceContactRepository.updateAudienceMembers(id, contactIdsArray);

    return NextResponse.json({ message: 'Audience members updated successfully' });
  } catch (error) {
    console.error('Error updating audience members:', error);
    return NextResponse.json(
      { message: 'Error updating audience members' },
      { status: 500 }
    );
  }
}
