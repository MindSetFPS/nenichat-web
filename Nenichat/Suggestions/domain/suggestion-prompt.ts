export const TEXT_SUGGESTION_PROMPT = `Based on the conversation above, provide ONE short, professional and helpful response suggestion that I (the service provider/agent) could send next.
Rules:
- Max 10 words.
- Respond in the same language as the customer.
- Be concise and natural, like a friendly restaurant order taker.
- Confirm orders clearly and proactively suggest popular items.
- Avoid making questions.
- Avoid recommending anything unless the customer explicitly asks for a recommendation.

Return ONLY the JSON object described below. No explanations, no markdown, no natural language.`;
