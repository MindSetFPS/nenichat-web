import { Ollama } from 'ollama';
import { z } from 'zod';
import { OLLAMA_MODELS, DEFAULT_MODEL } from './models';

export async function generateStructured<T extends z.ZodType>(
    ollama: Ollama,
    schema: T,
    prompt: string,
    modelName: string = DEFAULT_MODEL,
): Promise<z.infer<T>> {
    const model = OLLAMA_MODELS[modelName];
    const { name: modelName_, ...options } = model;

    if (!model) throw new Error(`Unknown model: ${modelName}`);

    const jsonSchema = z.toJSONSchema(schema);

    console.log([{ role: 'user', content: prompt }])

    const response = await ollama.chat({
        model: modelName_,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        format: jsonSchema,
        options,
    });

    console.log(response);

    return schema.parse(JSON.parse(response.message.content));
}
