import { IMessage } from '@/Nenichat/Messages/domain/IMessage';
import { DEFAULT_MODEL } from '@/Nenichat/Shared/infra/llm/models';
import { llm } from '@/Nenichat/Shared/infra/llm/client';
import { generateStructured } from '@/Nenichat/Shared/infra/llm/generate-structured';
import { ProductOrderListSchema, type ProductOrder } from '@/Nenichat/Orders/app/dto/product-order';
import { TEXT_SUGGESTION_PROMPT } from '@/Nenichat/Suggestions/domain/suggestion-prompt';
import { TextSuggestionListSchema } from '@/Nenichat/Suggestions/domain/llm-schemas';
import { chatToLlmHistory } from '@/Nenichat/Suggestions/app/chat-to-llm-history';
import type { SuggestionAction } from '@/Nenichat/Suggestions/domain/ISuggestionAction';

async function extractProductOrders(
    messages: IMessage[],
    modelName: string = DEFAULT_MODEL,
): Promise<{ orders: ProductOrder[] | null; promptTokens: number; completionTokens: number }> {
    const llmMessages = [
        ...chatToLlmHistory(messages),
        { role: 'user', content: 'Extract the product orders from the conversation above. Return ONLY a JSON object with an "orders" key containing an array of { productName, amount } objects. No explanations.' },
    ];
    try {
        const { data, promptTokens, completionTokens } = await generateStructured(llm, ProductOrderListSchema, llmMessages, modelName);
        return { orders: data.orders, promptTokens, completionTokens };
    } catch (e) {
        console.error('Failed to extract product orders:', e);
        return { orders: null, promptTokens: 0, completionTokens: 0 };
    }
}

async function generateTextSuggestions(
    messages: IMessage[],
    modelName: string = DEFAULT_MODEL,
): Promise<{ texts: string[]; promptTokens: number; completionTokens: number }> {
    const llmMessages = [
        ...chatToLlmHistory(messages),
        { role: 'user', content: TEXT_SUGGESTION_PROMPT },
    ];
    try {
        const { data, promptTokens, completionTokens } = await generateStructured(llm, TextSuggestionListSchema, llmMessages, modelName);
        return { texts: data.suggestions.map(s => s.text), promptTokens, completionTokens };
    } catch (e) {
        console.error('Failed to generate text suggestions:', e);
        return { texts: [], promptTokens: 0, completionTokens: 0 };
    }
}

export async function generateManySuggestions(
    messages: IMessage[],
    modelName: string = DEFAULT_MODEL,
): Promise<{ suggestions: SuggestionAction[]; promptTokens: number; completionTokens: number }> {
    const [textResult, orderResult] = await Promise.all([
        generateTextSuggestions(messages, modelName),
        extractProductOrders(messages, modelName),
    ]);

    const suggestions: SuggestionAction[] = [];

    for (const text of textResult.texts) {
        if (text.trim()) {
            suggestions.push({ action: "send_message", label: text, text });
        }
    }

    if (orderResult.orders && orderResult.orders.length > 0) {
        suggestions.push({
            action: "open_form",
            label: orderResult.orders.map(o => `${o.amount}x ${o.productName}`).join(', '),
            formType: "order",
            data: { orders: orderResult.orders },
        });
    }

    return {
        suggestions,
        promptTokens: textResult.promptTokens + orderResult.promptTokens,
        completionTokens: textResult.completionTokens + orderResult.completionTokens,
    };
}
