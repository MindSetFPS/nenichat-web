import { IMessage } from '@/Nenichat/Messages/domain/IMessage';
import { DEFAULT_MODEL } from '@/Nenichat/Shared/infra/llm/models';
import { ollama } from '@/Nenichat/Shared/infra/llm/client';
import { generateStructured } from '@/Nenichat/Shared/infra/llm/generate-structured';
import { ProductOrderListSchema } from '@/Nenichat/Orders/app/dto/product-order';
import { chatToOllamaHistory } from '@/Nenichat/Suggestions/app/chat-to-ollama-history';
import type { SuggestionAction } from '@/Nenichat/Suggestions/domain/ISuggestionAction';

export async function generateOneOrder(
    messages: IMessage[],
    modelName: string = DEFAULT_MODEL,
): Promise<{ suggestion: SuggestionAction | null; promptTokens: number; completionTokens: number }> {
    const llmMessages = [
        ...chatToOllamaHistory(messages),
        { role: 'user', content: 'Extract the product orders from the conversation above. Return ONLY a JSON object with an "orders" key containing an array of { productName, amount } objects. No explanations.' },
    ];
    try {
        const { data, promptTokens, completionTokens } = await generateStructured(ollama, ProductOrderListSchema, llmMessages, modelName);
        if (!data.orders || data.orders.length === 0) return { suggestion: null, promptTokens, completionTokens };
        return {
            suggestion: {
                action: "open_form",
                label: data.orders.map(o => `${o.amount}x ${o.productName}`).join(', '),
                formType: "order",
                data: { orders: data.orders },
            },
            promptTokens,
            completionTokens,
        };
    } catch (e) {
        console.error('Failed to generate order suggestion:', e);
        return { suggestion: null, promptTokens: 0, completionTokens: 0 };
    }
}
