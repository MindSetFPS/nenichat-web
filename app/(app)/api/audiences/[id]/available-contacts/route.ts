import { NextResponse } from 'next/server';
import { audienceContactRepository } from '@/Nenichat/Audiences/infra/persistance/AudienceContactRepository';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = parseInt((await params).id, 10);
        const availableMembers = await audienceContactRepository.findAvailableContacts(id);
        return NextResponse.json(availableMembers);
    } catch (error) {
        console.error('Error fetching available audience members:', error);
        return NextResponse.json(
            { message: 'Error fetching available audience members' },
            { status: 500 }
        );
    }
}
