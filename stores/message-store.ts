import { create } from 'zustand';
import { IMessageWithSender } from '@/Nenichat/Messages/domain/IMessageWithSender';

interface MessageState {
    messagesByChat: Record<string, IMessageWithSender[]>;
    setMessages: (jid: string, messages: IMessageWithSender[]) => void;
    addMessage: (jid: string, message: IMessageWithSender) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
    messagesByChat: {},

    setMessages: (jid, messages) =>
        set((state) => ({
            messagesByChat: { ...state.messagesByChat, [jid]: messages },
        })),

    addMessage: (jid, message) =>
        set((state) => ({
            messagesByChat: {
                ...state.messagesByChat,
                [jid]: [...(state.messagesByChat[jid] || []), message],
            },
        })),
}));
