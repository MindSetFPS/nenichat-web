import { IMessage } from '../../domain/IMessage';
import { IMessageRepository } from '../../domain/IMessageRepository';
import { IMessagesReport } from '../../domain/IMessagesReport';
import { IMessageWithSender } from '../../domain/IMessageWithSender';
import { Message } from '../../domain/Message';

/**
 * Implementation of IMessageRepository using Go-Whatsapp-Web-Multidevice API.
 * This repository interacts with an external WhatsApp gateway to send and retrieve messages.
 * 
 * @see https://github.com/aldinokemal/go-whatsapp-web-multidevice
 */
export class GoWappMessageRepository implements IMessageRepository {
    private baseUrl: string;
    private user?: string;
    private password?: string;

    /**
     * Creates an instance of GoWappMessageRepository.
     * @param {string} [baseUrl] - The base URL of the GoWapp API. Defaults to NEXT_PUBLIC_WAPP_API_URL or http://localhost:3000.
     * @param {string} [user] - Optional Basic Auth user.
     * @param {string} [password] - Optional Basic Auth password.
     */
    constructor(baseUrl?: string, user?: string, password?: string) {
        this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_WAPP_API_URL || 'http://localhost:3000';
        this.user = user;
        this.password = password;
    }

    /**
     * Helper to perform fetch requests to the GoWapp API.
     * @template T
     * @param {string} path - The API path.
     * @param {RequestInit} [options={}] - Fetch options.
     * @param {string} [user] - Optional Basic Auth user override.
     * @param {string} [password] - Optional Basic Auth password override.
     * @returns {Promise<T>} The parsed JSON response.
     * @private
     */
    private async request<T>(path: string, options: RequestInit = {}, user?: string, password?: string): Promise<T> {
        const authUser = user || this.user;
        const authPassword = password || this.password;

        const headers: any = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (authUser && authPassword) {
            headers['Authorization'] = `Basic ${btoa(`${authUser}:${authPassword}`)}`;
        }

        const response = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || errorData.error || `Status ${response.status}`;
            throw new Error(`GoWapp API: ${errorMessage}`);
        }

        return response.json();
    }

    /**
     * Helper to map a JID to an integer chat_id.
     * Strips suffixes and attempts to parse as number.
     * @param {string} jid - The WhatsApp JID.
     * @returns {number} The numeric part as number.
     * @private
     */
    private jidToInteger(jid: string): number {
        const numericPart = jid.split('@')[0];
        try {
            return parseInt(numericPart, 10);
        } catch {
            // For non-numeric JIDs, return 0 as a fallback.
            return 0;
        }
    }

    /**
     * Helper to map an integer chat_id to a JID.
     * Assumes individual chat if not specified.
     * @param {number} id - The numeric ID.
     * @param {boolean} [isGroup=false] - Whether it is a group JID.
     * @returns {string} The formatted JID.
     * @private
     */
    private integerToJid(id: number, isGroup: boolean = false): string {
        const suffix = isGroup ? '@g.us' : '@s.whatsapp.net';
        return `${id}${suffix}`;
    }

    /**
     * Maps partial API ChatMessage to IMessage domain object.
     * @param {any} apiMsg - The message object from the API.
     * @returns {IMessage} The mapped domain message.
     * @private
     */
    private mapToDomain(apiMsg: any): IMessage {
        return new Message(
            apiMsg.id,
            apiMsg.chat_jid || apiMsg.phone || '',
            apiMsg.sender_jid || '',
            apiMsg.content || apiMsg.message || null,
            apiMsg.timestamp || '',
            apiMsg.is_from_me || false,
            apiMsg.media_type || '',
            apiMsg.filename || '',
            apiMsg.url || '',
            apiMsg.file_length || 0,
            apiMsg.created_at || new Date().toISOString(),
            apiMsg.updated_at || new Date().toISOString(),
            undefined,
            undefined
        );
    }

    /**
     * Finds a message by its unique ID.
     * Note: This is not explicitly supported by the GoWapp API without chat context.
     * @param {string} id - The message ID.
     * @returns {Promise<IMessage | null>} The message or null if not found.
     */
    async findById(id: string): Promise<IMessage | null> {
        // API doesn't support global search by message ID.
        return null;
    }

    /**
     * Saves (sends) a message.
     * @param {Partial<IMessage>} message - The message data to save/send.
     * @returns {Promise<IMessage>} The created message.
     * @throws {Error} if chat_id is missing or sending fails.
     */
    async save(message: Partial<IMessage>): Promise<IMessage> {
        if (!message.chat_jid) {
            throw new Error('chat_jid is required to send a message');
        }

        const jid = message.chat_jid.includes('@') ? message.chat_jid : this.integerToJid(Number(message.chat_jid));

        const payload = {
            phone: jid,
            message: message.content || '',
            reply_message_id: message.replied_to_message_id,
        };

        const response = await this.request<any>('/send/message', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        if (response.code !== 'SUCCESS') {
            throw new Error(`Failed to send message: ${response.message}`);
        }

        const now = new Date().toISOString();
        return new Message(
            response.results.message_id,
            message.chat_jid,
            message.sender_jid || '0',
            message.content || null,
            now,
            true,
            '',
            '',
            '',
            0,
            now,
            now,
            message.replied_to_message_id,
            message.quoted_message_text
        );
    }

    /**
     * Lists messages with pagination.
     * Note: Global list is not supported by GoWapp API.
     * @param {number} offset - The number of records to skip.
     * @param {number} limit - The maximum number of records to return.
     * @returns {Promise<IMessage[]>} An empty array or list of messages.
     */
    async list(offset: number, limit: number): Promise<IMessage[]> {
        return [];
    }

    /**
     * Lists messages including sender information.
     * @param {number} offset - The number of records to skip.
     * @param {number} limit - The maximum number of records to return.
     * @returns {Promise<IMessageWithSender[]>} An empty array.
     */
    async listWithSender(offset: number, limit: number): Promise<IMessageWithSender[]> {
        const messages = await this.list(offset, limit);
        return messages.map(m => ({ ...m, sender: undefined }));
    }

    /**
     * Finds messages in a specific chat.
     * @param {string} chat_id - The chat JID or phone number.
     * @param {number} offset - The number of records to skip.
     * @param {number} limit - The maximum number of records to return.
     * @returns {Promise<IMessage[]>} List of messages in the chat.
     */
    async findByChatId(chat_id: string, offset: number, limit: number): Promise<IMessage[]> {
        // const jid = chat_id.includes('@') ? chat_id : this.integerToJid(Number(chat_id));

        const response = await this.request<any>(`/chat/${chat_id}/messages?limit=${limit}&offset=${offset}`);

        if (response.code !== 'SUCCESS') {
            return [];
        }

        const data = response.results?.data || [];
        return data.map((m: any) => this.mapToDomain(m));
    }

    /**
     * Finds messages in a specific chat including sender information.
     * @param {string} chat_id - The chat JID or phone number.
     * @param {number} offset - The number of records to skip.
     * @param {number} limit - The maximum number of records to return.
     * @returns {Promise<IMessageWithSender[]>} List of messages with sender data.
     */
    async findByChatIdWithSender(chat_id: string, offset: number, limit: number): Promise<IMessageWithSender[]> {
        const messages = await this.findByChatId(chat_id, offset, limit);
        return messages.map(m => ({ ...m, sender: undefined }));
    }

    /**
     * Returns the total count of messages.
     * @returns {Promise<number>} Always returns 0 as not supported.
     */
    async count(): Promise<number> {
        return 0;
    }

    /**
     * Returns a report of message counts per day.
     * @param {number} interval - The interval in days.
     * @returns {Promise<IMessagesReport[]>} An empty array.
     */
    async getMessageCountPerDay(interval: number): Promise<IMessagesReport[]> {
        return [];
    }

    /**
     * Retrieves the last message sent in a specific chat.
     * @param {number} chat_id - The chat ID.
     * @returns {Promise<IMessage | null>} The last message or null.
     */
    async getLastContactMessage(chat_id: number): Promise<IMessage | null> {
        // The GoWapp API does not support querying by internal database ID.
        // It only supports phone numbers (JIDs) or LIDs.
        return null;
    }


    /**
     * Retrieves the last message sent by phone number.
     * @param {string} phone_number - The phone number or JID.
     * @returns {Promise<IMessage | null>} The last message or null.
     */
    async getLastContactMessageByPhone(phone_number: string): Promise<IMessage | null> {
        try {
            const jid = phone_number.includes('@') ? phone_number : `${phone_number}@s.whatsapp.net`;
            const messages = await this.findByChatId(jid, 0, 1);
            return messages.length > 0 ? messages[0] : null;
        } catch {
            return null;
        }
    }

    /**
     * Retrieves the last message sent by LID.
     * @param {string} lid - The LID.
     * @returns {Promise<IMessage | null>} The last message or null.
     */
    async getLastContactMessageByLid(lid: string): Promise<IMessage | null> {
        try {
            const jid = lid.includes('@') ? lid : `${lid}@lid`;
            const messages = await this.findByChatId(jid, 0, 1);
            return messages.length > 0 ? messages[0] : null;
        } catch {
            return null;
        }
    }
}
