import OpenAI from 'openai';

// Placeholder key keeps module import safe during build-time page data collection;
// unconfigured environments fail at request time and are handled by callers.
export const llm = new OpenAI({
    baseURL: process.env.LLM_BASE_URL,
    apiKey: process.env.LLM_API_KEY || 'not-configured',
});
