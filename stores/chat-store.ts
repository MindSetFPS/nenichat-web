/**
 * Chat Store (Zustand)
 * 
 * Manages WhatsApp chat data on the client side with persistence.
 * 
 * ARCHITECTURE:
 * - Fetches chats from /api/chats endpoint (which has server-side cache)
 * - Stores chats in localStorage via Zustand persist middleware
 * - Provides add/remove/update methods for chat manipulation
 * - Tracks loading and loaded states for initialization
 * 
 * PERSISTENCE:
 * - Chats are persisted to localStorage under key 'nenichat-chats'
 * - On page reload, chats are restored from localStorage
 * - isLoaded flag is also persisted to avoid re-fetching on reload
 * 
 * TO EDIT:
 * - Change 'nenichat-chats' storage key for different persistence
 * - Modify partialize() to persist different state fields
 * - Add polling interval in fetchChats for automatic refresh
 * - Implement real-time updates via WebSocket in fetchChats
 * 
 * IMPORTANT:
 * - This store uses "always fetch first" strategy - it will fetch from API
 *   even if cached data exists in localStorage to ensure freshness
 * - The isLoaded flag prevents re-fetching on subsequent page loads
 * - To force refresh, clear the store or wait for TTL expiry
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IChat } from '@/Nenichat/Chats/domain/IChat';
import { getWappBaseUrl } from '@/lib/wapp/config';

interface ChatState {
    chats: IChat[];
    isLoaded: boolean;
    isLoading: boolean;
    error: string | null;
    networkError: boolean;

    fetchChats: (business: { id: number } | null) => Promise<void>;
    addChat: (chat: IChat) => void;
    removeChat: (chatId: string) => void;
    updateChat: (chatId: string, updates: Partial<IChat>) => void;
    clearChats: () => void;
    getChat: (chatId: string) => IChat | undefined;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            chats: [],
            isLoaded: false,
            isLoading: false,
            error: null,
            networkError: false,

            /**
             * Fetches chats from API endpoint
             * Uses "always fetch first" strategy - won't return cached data
             * without checking API first
             * 
             * TO MODIFY:
             * - Add polling: setInterval(() => fetchChats(), 60000)
             * - Add WebSocket listener for real-time updates
             * - Add cache-busting query param for forced refresh
             * 
             * NOTE: business data must be passed as parameter since hooks
             * cannot be used inside Zustand store functions
             */
            fetchChats: async (business: { id: number } | null) => {
                const { isLoading, isLoaded } = get();

                // Prevent concurrent or redundant fetches
                if (isLoading || isLoaded) {
                    return;
                }

                if (!business?.id) {
                    console.error('No business id found for fetching chats');
                    return;
                }

                // The gateway origin only; the server-side repository appends /api/user/{businessId}
                const wappUrl = getWappBaseUrl();

                set({ isLoading: true, error: null, networkError: false });

                try {
                    const params = new URLSearchParams({
                        businessId: business.id.toString(),
                        wappUrl: wappUrl,
                    });

                    const response = await fetch(`/api/chats?${params.toString()}`);

                    if (!response.ok) {
                        let errorCode = 'fetch_failed';
                        try {
                            const body = await response.json();
                            if (body?.error) {
                                errorCode = body.error;
                            }
                        } catch {
                            // ignore parse errors
                        }
                        set({ error: errorCode, isLoaded: true, isLoading: false });
                        return;
                    }

                    const chats: IChat[] = await response.json();

                    set({
                        chats,
                        isLoaded: true,
                        isLoading: false,
                    });
                } catch (error) {
                    console.error('Error fetching chats:', error);
                    if (error instanceof TypeError && error.message === 'Failed to fetch') {
                        set({ networkError: true, isLoaded: true, isLoading: false });
                    } else {
                        set({ error: 'unknown', isLoaded: true, isLoading: false });
                    }
                }
            },

            /**
             * Add a new chat to the store
             * Prevents duplicates by checking if chat already exists
             * 
             * TO USE:
             * const { addChat } = useChatStore();
             * addChat(newChat);
             */
            addChat: (chat: IChat) => {
                set((state) => {
                    const exists = state.chats.some((c) => c.jid === chat.jid);
                    if (exists) {
                        return state;
                    }
                    return { chats: [...state.chats, chat] };
                });
            },

            /**
             * Remove a chat from the store by JID
             * 
             * TO USE:
             * const { removeChat } = useChatStore();
             * removeChat('123456789@s.whatsapp.net');
             */
            removeChat: (chatId: string) => {
                set((state) => ({
                    chats: state.chats.filter((c) => c.jid !== chatId),
                }));
            },

            /**
             * Update a chat's properties
             * 
             * TO USE:
             * const { updateChat } = useChatStore();
             * updateChat('123456789@s.whatsapp.net', { name: 'New Name' });
             */
            updateChat: (chatId: string, updates: Partial<IChat>) => {
                set((state) => ({
                    chats: state.chats.map((c) =>
                        c.jid === chatId ? { ...c, ...updates } : c
                    ),
                }));
            },

            /**
             * Clear all chats and reset loaded state
             * Use when user logs out or needs fresh start
             * 
             * TO USE:
             * const { clearChats } = useChatStore();
             * clearChats();
             */
            clearChats: () => {
                set({ chats: [], isLoaded: false, error: null });
            },

            /**
             * Get a single chat by JID
             * 
             * TO USE:
             * const { getChat } = useChatStore();
             * const chat = getChat('123456789@s.whatsapp.net');
             */
            getChat: (chatId: string) => {
                return get().chats.find((c) => c.jid === chatId);
            },
        }),
        {
            /**
             * Persistence configuration
             * 
             * TO CHANGE STORAGE KEY:
             * Replace 'nenichat-chats' with your preferred key
             * 
             * TO PERSIST MORE STATE:
             * Add more fields to the partialize return object
             * Example: { chats: state.chats, isLoaded: state.isLoaded, error: state.error }
             */
            name: 'nenichat-chats',
            partialize: (state) => ({
                chats: state.chats,
                isLoaded: state.isLoaded,
            }),
        }
    )
);