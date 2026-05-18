export interface ModelConfig {
    name: string;
    temperature: number;
    top_k?: number;
    top_p?: number;
    presence_penalty?: number;
    num_predict?: number;
    num_ctx?: number;
    seed?: number;
    min_p?: number;
    stop?: string[];
    [key: string]: unknown;
}

export const OLLAMA_MODELS: Record<string, ModelConfig> = {
    'qwen3.5:0.8b': {
        name: 'qwen3.5:0.8b',
        temperature: 1,
        top_k: 20,
        top_p: 0.95,
        think: false,
        presence_penalty: 1.5,
    },
    'qwen3.5:4b': {
        name: 'qwen3.5:4b',
        temperature: 1,
        top_k: 20,
        top_p: 0.95,
        think: false,
        presence_penalty: 1.5,
    },
};

export const DEFAULT_MODEL = 'qwen3.5:4b';
