import { NextRequest, NextResponse } from 'next/server';
import { generateManySuggestions } from '@/Nenichat/Suggestions/app/generate-suggestions';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const { messages, model: modelName } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Missing or invalid messages' }, { status: 400 });
        }

        const suggestions = await generateManySuggestions(messages, 1, modelName);

        return NextResponse.json({ suggestions: suggestions.slice(0, 4) });
    } catch (error) {
        console.error('Error in suggestions API:', error);
        return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
    }
}
