import { z } from 'zod';

export const TextSuggestionSchema = z.object({
    text: z.string().describe('A short, professional reply the agent could send next'),
});

export const TextSuggestionListSchema = z.object({
    suggestions: z.array(z.object({
        text: z.string().describe('A short, professional reply the agent could send next'),
    })).describe('List of response suggestions for the agent'),
});
