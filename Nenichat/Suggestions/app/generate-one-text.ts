import { IMessage } from '@/Nenichat/Messages/domain/IMessage';
import { DEFAULT_MODEL } from '@/Nenichat/Shared/infra/llm/models';
import { llm } from '@/Nenichat/Shared/infra/llm/client';
import { generateStructured } from '@/Nenichat/Shared/infra/llm/generate-structured';
import { TEXT_SUGGESTION_PROMPT } from '@/Nenichat/Suggestions/domain/suggestion-prompt';
import { TextSuggestionSchema } from '@/Nenichat/Suggestions/domain/llm-schemas';
import { chatToLlmHistory } from '@/Nenichat/Suggestions/app/chat-to-llm-history';
import type { SuggestionAction } from '@/Nenichat/Suggestions/domain/ISuggestionAction';

export async function generateOneText(
    messages: IMessage[],
    modelName: string = DEFAULT_MODEL,
): Promise<{ suggestion: SuggestionAction | null; promptTokens: number; completionTokens: number }> {
    const llmMessages = [
        ...chatToLlmHistory(messages),
        { role: 'user', content: TEXT_SUGGESTION_PROMPT },
    ];

    try {
        const { data, promptTokens, completionTokens } = await generateStructured(llm, TextSuggestionSchema, llmMessages, modelName);
        const text = data.text.trim();
        if (!text) return { suggestion: null, promptTokens, completionTokens };
        return { suggestion: { action: "send_message", label: text, text }, promptTokens, completionTokens };
    } catch (e) {
        console.error('Failed to generate text suggestion:', e);
        return { suggestion: null, promptTokens: 0, completionTokens: 0 };
    }
}
