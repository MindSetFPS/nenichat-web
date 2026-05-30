import { Ollama } from 'ollama';
import { z } from 'zod';
import { OLLAMA_MODELS, DEFAULT_MODEL } from './models';

export async function generateStructured<T extends z.ZodType>(
    ollama: Ollama,
    schema: T,
    messages: { role: string; content: string }[],
    modelName: string = DEFAULT_MODEL,
): Promise<{ data: z.infer<T>; promptTokens: number; completionTokens: number }> {
    const model = OLLAMA_MODELS[modelName];
    const { name: modelName_, ...options } = model;

    if (!model) throw new Error(`Unknown model: ${modelName}`);

    const jsonSchema = z.toJSONSchema(schema);
    const response = await ollama.chat({
        model: modelName_,
        messages,
        stream: false,
        think: true,
        format: jsonSchema,
        keep_alive: '15m',
        options,
    });
    const data = schema.parse(JSON.parse(response.message.content));

    return {
        data,
        promptTokens: response.prompt_eval_count,
        completionTokens: response.eval_count,
    };
}
