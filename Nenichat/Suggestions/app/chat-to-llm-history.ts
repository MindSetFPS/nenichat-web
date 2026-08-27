import { IMessage } from '@/Nenichat/Messages/domain/IMessage';

export function chatToLlmHistory(messages: IMessage[]): { role: 'user' | 'assistant'; content: string }[] {
    return [...messages].map(m => ({
        role: m.sender_jid !== m.chat_jid ? 'assistant' : 'user',
        content: m.content || '',
    }));
}
