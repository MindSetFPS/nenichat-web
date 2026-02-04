import { IMessage } from '@/Nenichat/Messages/domain/IMessage';
import { Ollama } from 'ollama';

const OLLAMA_MODEL = 'llama3.2:1b';
const ollama = new Ollama({ host: process.env.OLLAMA_HOST });

const SUGGESTION_PROMPT = `
Based on the conversation above, provide ONE short, professional and helpful response suggestion that I (the service provider/agent) could send next. 
Rules:
- Max 10 words.
- Respond in the same language as the customer.
- Return ONLY a JSON object with a "suggestion" key. No explanation.
Example: {"suggestion": "Sure, let me check"}
`;

/**
 * Formats conversation messages into a context string for the prompt.
 * @param messages - Array of message objects with sender and text_content
 * @returns Formatted context string
 */
export function formatConversationContext(messages: IMessage[]): string {
    return [...messages]
        // .reverse() // messages come in newest-first, we want chronological
        .map((m: IMessage) => `${m.sender_id !== m.chat_id ? 'Me' : 'Customer'}: ${m.text_content || ''}`)
        .join('\n');
}

/**
 * Constructs the prompt for suggestion generation.
 * @param context - Formatted conversation context
 * @returns Complete prompt string
 */
export function constructSuggestionPrompt(context: string): string {
    return `Context:\n${context}\n${SUGGESTION_PROMPT}`;
}

/**
 * Fetches a single suggestion from Ollama.
 * @param prompt - The prompt to send to Ollama
 * @returns A single suggestion string or null if it fails
 */
export async function generateSuggestion(
    prompt: string,
): Promise<string | null> {
    try {
        const response = await ollama.generate({
            model: OLLAMA_MODEL,
            prompt: prompt,
            format: 'json',
            stream: false,
            options: {
                temperature: 0.8, // Higher temperature for more variety across calls
            }
        });

        const parsed = JSON.parse(response.response);

        if (parsed.suggestion) return parsed.suggestion;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        return parsed;
    } catch (e) {
        console.error('Failed to fetch or parse suggestion:', e);
        return null;
    }
}

/**
 * Fetches multiple suggestions and deduplicates them.
 * @param prompt - The prompt to send to Ollama
 * @param count - Number of suggestions to fetch (default: 2)
 * @returns Array of unique suggestion strings
 */
export async function generateManySuggestions(
    prompt: string,
    count: number = 4
): Promise<string[]> {
    const results = await Promise.all(
        Array(count).fill(null).map(() => generateSuggestion(prompt))
    );

    // Filter out nulls and remove duplicates
    return Array.from(new Set(results.filter((s): s is string => s !== null)));
}
