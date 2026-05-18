import { IMessage } from '@/Nenichat/Messages/domain/IMessage';
import { OLLAMA_MODELS, DEFAULT_MODEL } from '@/Nenichat/Shared/infra/llm/models';
import { ollama } from '@/Nenichat/Shared/infra/llm/client';
import { generateStructured } from '@/Nenichat/Shared/infra/llm/generate-structured';
import { ProductOrderListSchema, type ProductOrder } from '@/Nenichat/Orders/app/dto/product-order';
import { formatConversationContext } from '@/Nenichat/Suggestions/domain/suggestion-prompt';

export async function generateTextSuggestion(
    prompt: string,
    modelName: string = DEFAULT_MODEL,
): Promise<string | null | undefined> {
    const model = OLLAMA_MODELS[modelName];
    if (!model) {
        console.error(`Unknown model: ${modelName}`);
        return null;
    }
    const { name: modelName_, ...options } = model;
    console.log(options)
    try {
        const response = await ollama.generate({
            model: modelName_,
            prompt: prompt,
            format: 'json',
            stream: false,
            options,
        });

        console.log('Ollama response:', response);

        const responseText = response.response || response.thinking || '';
        const parsed = JSON.parse(responseText);

        if (typeof parsed.suggestion === 'string' && parsed.suggestion.trim()) return parsed.suggestion;
    } catch (e) {
        console.error('Failed to fetch or parse suggestion:', e);
        return null;
    }
}


// A function that takes the conversation, and using an LLM extracts and
// returns a list of products with the amoun, to then pass it to the OrderForm.
export async function extractProductOrders(
    messages: IMessage[],
    modelName: string = DEFAULT_MODEL,
): Promise<ProductOrder[] | null> {
    const context = formatConversationContext(messages);
    const prompt = `Extract the product orders from this conversation:\n${context}`;
    try {
        const result = await generateStructured(ollama, ProductOrderListSchema, prompt, modelName);
        return result.orders;
    } catch (e) {
        console.error('Failed to extract product orders:', e);
        return null;
    }
}

export async function generateManySuggestions(
    messages: IMessage[],
    count: number = 4,
    modelName: string = DEFAULT_MODEL,
): Promise<string[]> {
    const results = await Promise.all(
        Array(count).fill(null).map(() => extractProductOrders(messages, modelName))
    );

    return Array.from(new Set(
        results
            .flatMap((o) => o ?? [])
            .filter((o): o is ProductOrder => o !== null)
            .map((o) => `${o.amount}x ${o.productName}`)
    ));
}
