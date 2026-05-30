import { NextRequest, NextResponse } from 'next/server';
import { generateOneText } from '@/Nenichat/Suggestions/app/generate-one-text';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const { messages, model: modelName } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Missing or invalid messages' }, { status: 400 });
        }

        const result = await generateOneText(messages, modelName);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in text suggestion API:', error);
        return NextResponse.json({ error: 'Failed to generate text suggestion' }, { status: 500 });
    }
}
