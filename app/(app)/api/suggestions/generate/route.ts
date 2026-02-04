import { NextRequest, NextResponse } from 'next/server';
import { formatConversationContext, constructSuggestionPrompt, generateManySuggestions } from '@/lib/suggestions';

export const maxDuration = 60; // Set route timeout to 1 minute

/**
 * API route to generate suggestions from Ollama.
 * @param request 
 * @returns 
 */
export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Missing or invalid messages' }, { status: 400 });
        }

        const context = formatConversationContext(messages);
        const prompt = constructSuggestionPrompt(context);
        console.log(prompt)
        const suggestions = await generateManySuggestions(prompt);

        return NextResponse.json({ suggestions: suggestions.slice(0, 4) });
    } catch (error) {
        console.error('Error in suggestions API:', error);
        return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
    }
}
