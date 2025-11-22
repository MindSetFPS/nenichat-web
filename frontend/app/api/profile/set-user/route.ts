
import { NextRequest, NextResponse } from 'next/server';
import { contactRepository } from '@/Nenichat/Chats/infra/persistance/ContactRepository';

export async function POST(request: NextRequest) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const user = await contactRepository.setMe(BigInt(userId));
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error setting user:', error);
    return NextResponse.json({ error: 'Failed to set user' }, { status: 500 });
  }
}
