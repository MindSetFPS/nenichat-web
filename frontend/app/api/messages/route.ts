import { NextRequest, NextResponse } from 'next/server';
import { messageRepository } from '@/repository/MessageRepository';

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
