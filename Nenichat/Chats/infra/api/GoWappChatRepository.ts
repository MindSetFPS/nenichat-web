import { IChat } from '../../domain/IChat';
import { getJidKind } from '../../domain/Jid';
import { IChatRepository } from '../../domain/IChatRepository';
import { Chat } from '../../domain/Chat';
import { Wapp } from '@/Nenichat/Wapp';

interface ApiChat {
    jid?: string;
    name?: string;
    last_message_time?: string;
    ephemeral_expiration?: number;
    created_at?: string;
    updated_at?: string;
}

interface ChatListResults {
    data?: ApiChat[];
}

interface DeviceListResults {
    data?: Record<string, unknown>[];
}

interface CheckPhoneResults {
    is_on_whatsapp?: boolean;
}

/**
 * Implementation of IChatRepository using Go-Whatsapp-Web-Multidevice API.
 * This repository interacts with an external WhatsApp gateway to manage chats.
 *
 * @see https://github.com/aldinokemal/go-whatsapp-web-multidevice
 */
export class GoWappChatRepository implements IChatRepository {
    private wapp: Wapp;

    /**
     * Creates an instance of GoWappChatRepository.
     * @param {string} [baseUrl] - The base URL of the GoWapp API. Defaults to NEXT_PUBLIC_WAPP_API_URL or http://localhost:3000.
     * @param {string} [user] - Optional Basic Auth user.
     * @param {string} [password] - Optional Basic Auth password.
     * @param {string} [deviceId] - Optional device ID for the API.
     */
    constructor(baseUrl?: string, user?: string, password?: string, deviceId?: string) {
        this.wapp = new Wapp({ baseUrl, user, password, deviceId });
    }

    /**
     * Maps an API Chat object to a domain Chat object.
     * @param {any} apiChat - The chat object from the API.
     * @returns {IChat} The mapped domain chat.
     * @private
     */
    private mapToDomain(apiChat: ApiChat): IChat {
        const isGroup = apiChat.jid ? getJidKind(apiChat.jid) === 'group' : false;
        return new Chat(
            apiChat.jid || '',
            apiChat.name || apiChat.jid || 'Unknown',
            apiChat.last_message_time ? new Date(apiChat.last_message_time) : new Date(),
            apiChat.ephemeral_expiration || 0,
            isGroup,
            apiChat.created_at ? new Date(apiChat.created_at) : new Date(),
            apiChat.updated_at ? new Date(apiChat.updated_at) : new Date()
        );
    }

    /**
     * Finds a chat by its ID.
     * Note: This implementation searches through the recent chat list.
     * @param {string} id - The chat ID.
     * @returns {Promise<IChat | null>} The chat or null if not found.
     */
    async findById(id: string): Promise<IChat | null> {
        // Since there isn't a direct "get chat by ID" endpoint that works for both users and groups
        // in the same way, we search the chat list. We use a generous limit for the initial search.
        const response = await this.wapp.request<ChatListResults>('/chats?limit=100&offset=0');
        if (response.code === 'SUCCESS' && response.results?.data) {
            const found = response.results.data.find((c) => c.jid === id);
            if (found) {
                // Determine group status from JID if available
                return this.mapToDomain(found);
            }
        }

        return null;
    }

    /**
     * Checks if a phone number/JID exists on WhatsApp.
     * @param {string} jid - The JID to check.
     * @returns {Promise<boolean>} True if it exists on WhatsApp.
     */
    async checkPhone(jid: string): Promise<boolean> {
        try {
            const phone = jid.split('@')[0];
            const response = await this.wapp.request<CheckPhoneResults>(`/user/check?phone=${phone}`);
            return response.code === 'SUCCESS' && response.results?.is_on_whatsapp === true;
        } catch (e) {
            console.error(`Error checking phone ${jid}:`, e);
            return false;
        }
    }

    async getDevices() {
        const response = await this.wapp.request<DeviceListResults>('/devices');
        if (response.code === 'SUCCESS' && response.results?.data) {
            return response.results.data;
        }
        return [];
    }

    /**
     * Saves or updates a chat.
     * Note: GoWapp API manages chats automatically; this method primarily
     * constructs a local representation.
     * @param {Partial<IChat>} chat - The chat data to save.
     * @returns {Promise<IChat>} The saved chat.
     * @throws {Error} if JID is missing.
     */
    async save(chat: Partial<IChat>): Promise<IChat> {
        if (chat.jid === undefined) {
            throw new Error('Chat JID must be provided to save a chat.');
        }

        // Mutations like creating groups would use different endpoints.
        // For a general save, we return the constructed object.
        return new Chat(
            chat.jid,
            chat.name || 'Unknown',
            chat.last_message_time || new Date(),
            chat.ephemeral_expiration || 0,
            chat.is_group || false,
            chat.created_at || new Date(),
            chat.updated_at || new Date()
        );
    }

    /**
     * Lists chats with pagination.
     * @param {number} offset - The number of records to skip.
     * @param {number} limit - The maximum number of records to return.
     * @returns {Promise<IChat[]>} List of chats.
     */
    async list(offset: number, limit: number): Promise<IChat[]> {
        const response = await this.wapp.request<ChatListResults>(`/chats?limit=${limit}&offset=${offset}`);

        if (response.code !== 'SUCCESS') {
            return [];
        }

        const data = response.results?.data || [];
        return data.map((c) => this.mapToDomain(c));
    }
}
