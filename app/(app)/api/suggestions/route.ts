import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Set route timeout to 1 minute

/**
 * An edpoint, when using get it will return existing chat suggestions for a specific chat.
 * @param request 
 * @returns 
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const chatId = searchParams.get('chat_id');

        if (!chatId) {
            return NextResponse.json(
                { error: 'Missing chat_id parameter' },
                { status: 400 }
            );
        }

        return NextResponse.json({ suggestions: [] });
    } catch (error) {
        console.error('Error fetching chat suggestions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chat suggestions' },
            { status: 500 }
        );
    }
}

