import { IChat } from '../../domain/IChat';
import { getJidKind } from '../../domain/Jid';
import { IChatRepository } from '../../domain/IChatRepository';
import { Chat } from '../../domain/Chat';

/**
 * Implementation of IChatRepository using Go-Whatsapp-Web-Multidevice API.
 * This repository interacts with an external WhatsApp gateway to manage chats.
 * 
 * @see https://github.com/aldinokemal/go-whatsapp-web-multidevice
 */
export class GoWappChatRepository implements IChatRepository {
    private baseUrl: string;
    private user?: string;
    private password?: string;

    /**
     * Creates an instance of GoWappChatRepository.
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
            throw new Error(errorData.message || `GoWapp API request failed with status ${response.status}`);
        }

        return response.json();
    }

    /**
     * Helper to map a JID to an integer chat ID.
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
     * Maps an API Chat object to a domain Chat object.
     * @param {any} apiChat - The chat object from the API.
     * @returns {IChat} The mapped domain chat.
     * @private
     */
    private mapToDomain(apiChat: any): IChat {
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
        const response = await this.request<any>('/chats?limit=100&offset=0');
        if (response.code === 'SUCCESS' && response.results?.data) {
            const found = response.results.data.find((c: any) => c.jid === id);
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
            const response = await this.request<any>(`/user/check?phone=${phone}`);
            return response.code === 'SUCCESS' && response.results?.on_whatsapp === true;
        } catch (e) {
            console.error(`Error checking phone ${jid}:`, e);
            return false;
        }
    }

    async getDevices() {
        const response = await this.request<any>('/devices');
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
        const response = await this.request<any>(`/chats?limit=${limit}&offset=${offset}`);

        if (response.code !== 'SUCCESS') {
            return [];
        }

        const data = response.results?.data || [];
        return data.map((c: any) => this.mapToDomain(c));
    }
}
