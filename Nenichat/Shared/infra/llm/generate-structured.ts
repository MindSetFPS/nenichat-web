import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { z } from 'zod';
import { LLM_MODELS, DEFAULT_MODEL } from './models';

export async function generateStructured<T extends z.ZodType>(
    llm: OpenAI,
    schema: T,
    messages: { role: string; content: string }[],
    modelName: string = DEFAULT_MODEL,
): Promise<{ data: z.infer<T>; promptTokens: number; completionTokens: number }> {
    const model = LLM_MODELS[modelName];

    if (!model) throw new Error(`Unknown model: ${modelName}`);

    // Only forward sampling params that are valid across OpenAI-compatible APIs.
    const { temperature, top_p, top_k, presence_penalty, seed, stop } = model;
    const options = {
        ...(temperature !== undefined && { temperature }),
        ...(top_p !== undefined && { top_p }),
        ...(top_k !== undefined && { top_k }),
        ...(presence_penalty !== undefined && { presence_penalty }),
        ...(seed !== undefined && { seed }),
        ...(stop !== undefined && { stop }),
    };

    const jsonSchema = z.toJSONSchema(schema);
    const response = await llm.chat.completions.create({
        model: modelName,
        messages: messages as ChatCompletionMessageParam[],
        stream: false,
        response_format: {
            type: 'json_schema',
            json_schema: { name: 'response', schema: jsonSchema, strict: false },
        },
        ...options,
    });

    const content = response.choices[0]?.message?.content ?? '';
    const data = schema.parse(JSON.parse(content));

    return {
        data,
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
    };
}
