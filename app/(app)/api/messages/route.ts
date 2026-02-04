import { NextRequest, NextResponse } from 'next/server';
import { messageRepository } from '@/Nenichat/Messages/infra/persistance/MessageRepository';
import SendMessage from '@/Nenichat/Messages/app/send-message';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const offset = (page - 1) * pageSize;
  const messages = await messageRepository.listWithSender(offset, pageSize);
  const total = await messageRepository.count();

  return NextResponse.json({
    data: messages,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
}


/**
 * API route to send a message.
 * @param request 
 * @returns 
 */
export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json({ error: 'Missing phone or message' }, { status: 400 });
    }

    await SendMessage(phone, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in send message API:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
