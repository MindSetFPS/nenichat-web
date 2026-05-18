import { IMessage } from '@/Nenichat/Messages/domain/IMessage';

const SUGGESTION_PROMPT = `
Based on the conversation above, provide ONE short, professional and helpful response suggestion that I (the service provider/agent) could send next.
Rules:
- Max 10 words.
- Respond in the same language as the customer.
- Be concise and natural, like a friendly restaurant order taker.
- Confirm orders clearly and proactively suggest popular items like pechuga parmesana.
- Return ONLY a JSON object with a "suggestion" key. No explanation.

Examples:
- user: "Buen dia, bistec con papas por favor" →
{suggestion: "Buen día! Te confirmo un Bistec con Papas."}
- user: "Buenos días, le encargo de favor bistec con papas" →
{suggestion: "Claro! Te confirmo tu pedido de Bistec con Papas."}
- user: "Media de pechuga parmesana" →
{suggestion: response: "Perfecto! Una Pechuga Parmesana."}
- user: "Van a ser 4 parmesanas para aqui el banco" →
{suggestion: "Perfecto! 4 Pechugas Parmesana."}
`;

export function formatConversationContext(messages: IMessage[]): string {
    return [...messages]
        .map((m: IMessage) => `${m.sender_jid !== m.chat_jid ? 'Me' : 'Customer'}: ${m.content || ''}`)
        .join('\n');
}

export function constructSuggestionPrompt(context: string): string {
    return `Context:\n${context}\n${SUGGESTION_PROMPT}`;
}
