import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Set route timeout to 1 minute

/**
 * API route to get message suggestions from Ollama.
 * @param request 
 * @returns 
 */
export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Missing or invalid messages' }, { status: 400 });
        }
        // Format conversation history for Ollama (ensure chronological order)
        const context = [...messages]
            // .reverse() // messages come in newest-first, we want chronological // its already chronological
            .slice(-10) // Take last 10 messages for context
            .map((m: any) => `${m.sender?.contact_name || (m.sender?.is_user ? 'Me' : 'Customer')}: ${m.text_content || ''}`)
            .join('\n');

        const prompt = `
Context:
${context}

Based on the conversation above, provide ONE short, professional and helpful response suggestion that I (the service provider/agent) could send next. 
Rules:
- Max 10 words.
- Return ONLY a JSON object with a "suggestion" key. No explanation.
Example: {"suggestion": "Sure, let me check"}
`;

        console.log(prompt);

        /**
         * Helper function to fetch a single suggestion from Ollama.
         * @returns A single suggestion string or null if it fails.
         */
        const fetchSuggestion = async (): Promise<string | null> => {
            try {
                const response = await fetch('http://192.168.1.64:11434/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'llama3.1:8b-instruct-q4_K_M',
                        prompt: prompt,
                        stream: false,
                        format: 'json',
                        options: {
                            temperature: 0.8, // Higher temperature for more variety across calls
                        }
                    }),
                    signal: AbortSignal.timeout(30000), // 30 second timeout per call
                });

                if (!response.ok) {
                    console.error(`Ollama API error: ${response.statusText}`);
                    return null;
                }

                const data = await response.json();
                console.log(data);
                const parsed = JSON.parse(data.response);

                if (parsed.suggestion) return parsed.suggestion;
                if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
                return parsed;
            } catch (e) {
                console.error('Failed to fetch or parse suggestion:', e);
                return null;
            }
        };

        // Fetch 4 suggestions in parallel
        const results = await Promise.all([
            fetchSuggestion(),
            fetchSuggestion(),
            fetchSuggestion(),
            fetchSuggestion()
        ]);

        // Filter out nulls and remove duplicates
        let suggestions = Array.from(new Set(results.filter((s): s is string => s !== null)));

        // If we don't have enough, or it failed completely, provide fallbacks
        if (suggestions.length === 0) {
            suggestions = ["How can I help you?", "Got it, thanks!", "Let me check that for you.", "What else do you need?"];
        }

        return NextResponse.json({ suggestions: suggestions.slice(0, 4) });
    } catch (error) {
        console.error('Error in suggestions API:', error);
        return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
    }
}
