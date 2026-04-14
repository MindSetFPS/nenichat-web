/**
 * Contact Initializer Component
 * 
 * Initializes contact data by fetching from chats.
 * 
 * ARCHITECTURE:
 * - Depends on ChatInitializer (chats must be loaded first)
 * - Extracts JIDs from chats and fetches matching contacts from database
 * - Only fetches contacts that aren't already in the contact store
 * - Updates the contact store with new contacts
 * 
 * DATA FLOW:
 * 1. ChatInitializer fetches and stores chats in chat-store
 * 2. ContactInitializer detects chats are loaded
 * 3. Extracts JIDs from chats (phone numbers and group IDs)
 * 4. Filters out contacts already in store (avoids duplicate fetches)
 * 5. Calls /api/contacts/batch to fetch missing contacts
 * 6. Updates contact-store with new contacts
 * 
 * TO EDIT:
 * - Modify the batch fetch logic for different contact sources
 * - Add contact deduplication logic
 * - Change how contacts are matched (currently by phone/lid)
 * - Add caching strategy for contacts separately from chats
 * 
 * IMPORTANT:
 * - This runs AFTER ChatInitializer completes
 * - Contacts are fetched in batch (not one-by-one) for efficiency
 * - Only missing contacts are fetched (uses contactsByPhone/Lid checks)
 * 
 * RELATIONSHIP WITH CHATS:
 * - Chats provide the list of JIDs (who to fetch contacts for)
 * - Contacts provide the display names and profile data
 * - Both are needed for the full contact experience
 */

'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/stores/chat-store';
import { useContactStore } from '@/stores/contact-store';
import { getJidKind } from '@/Nenichat/Chats/domain/Jid';
import { useBusiness } from '@/hooks/use-business';

interface ContactInitializerProps {
    children: React.ReactNode;
}

export function ContactInitializer({ children }: ContactInitializerProps) {
    const { chats, isLoaded: chatsLoaded } = useChatStore();
    const { setContacts, contactsByPhone, contactsByLid } = useContactStore();
    const business = useBusiness();

    useEffect(() => {
        // Wait for chats to be loaded
        if (!chatsLoaded || chats.length === 0) {
            return;
        }

        // Extract JIDs from chats for contact lookup
        const lookups: { value: string; is_lid: boolean }[] = [];
        for (const chat of chats) {
            const jidKind = getJidKind(chat.jid);
            if (jidKind !== 'unknown') {
                lookups.push({ value: chat.jid, is_lid: jidKind === 'lid' || jidKind === 'group' });
            }
        }

        // Filter out contacts that are already in the store
        const toFetch = lookups.filter((lookup) => {
            if (lookup.is_lid) {
                return !contactsByLid.has(lookup.value);
            }
            const normalized = lookup.value.replace(/[^\d]/g, '');
            return !contactsByPhone.has(normalized);
        });

        // No contacts to fetch
        if (toFetch.length === 0) {
            return;
        }

        // Fetch missing contacts from API
        const fetchContacts = async () => {
            try {
                const response = await fetch('/api/contacts/batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        business_id: business?.id,
                        lookups: toFetch,
                    }),
                });

                if (response.ok) {
                    const contacts = await response.json();
                    if (contacts.length > 0) {
                        setContacts(contacts);
                    }
                }
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        fetchContacts();
        // }, [chats, chatsLoaded, business, setContacts, contactsByPhone, contactsByLid]);
    }, []);

    return <>{children}</>;
}