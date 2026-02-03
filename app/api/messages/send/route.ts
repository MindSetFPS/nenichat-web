import { NextRequest, NextResponse } from 'next/server';
import SendMessage from '@/Nenichat/Messages/app/send-message';

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
