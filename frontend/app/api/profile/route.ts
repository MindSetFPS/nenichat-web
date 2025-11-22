
import { NextResponse } from 'next/server';
import { contactRepository } from '@/Nenichat/Chats/infra/persistance/ContactRepository';

export async function GET() {
  try {
    const user = await contactRepository.findMe();
    if (!user) {
      return NextResponse.json(null, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}
