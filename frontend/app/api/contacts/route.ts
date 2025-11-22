import { NextRequest, NextResponse } from 'next/server';
import { contactRepository } from '@/Nenichat/Chats/infra/persistance/ContactRepository';
import { IContact } from '@/Nenichat/Chats/domain/IContact';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const offset = (page - 1) * pageSize;

    const contacts = await contactRepository.list(offset, pageSize);

    // Get total count - we'll need to add a count method to the repository
    // For now, we'll fetch a large number and count them
    const allContacts = await contactRepository.list(0, 10000);
    const total = allContacts.length;

    return NextResponse.json({
        data: contacts,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
    });
}

export async function POST(request: NextRequest) {
    try {
        const body: Partial<IContact> = await request.json();

        if (!body.phone_number && !body.lid) {
            return NextResponse.json({ message: 'phone_number or lid is required' }, { status: 400 });
        }

        const contact = await contactRepository.save(body);
        return NextResponse.json(contact);
    } catch (e) {
        const error = e as Error;
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
