import { create } from 'zustand';
import { IContact } from '@/Nenichat/Contacts/domain/IContact';
import { useUserStore } from './user-store';

interface ContactState {
    contactsByPhone: Map<string, IContact>;
    contactsByLid: Map<string, IContact>;
    isLoading: boolean;
    error: string | null;

    getContact: (phoneOrLid: string) => IContact | undefined;
    setContact: (contact: IContact) => void;
    setContacts: (contacts: IContact[]) => void;
    fetchContact: (phoneOrLid: string) => Promise<IContact | null>;
    fetchContacts: (phoneOrLids: string[]) => Promise<void>;
    clearContacts: () => void;
}

const normalizePhone = (phone: string): string => {
    return phone.toLowerCase().replace(/[^\d]/g, '');
};

export const useContactStore = create<ContactState>((set, get) => ({
    contactsByPhone: new Map(),
    contactsByLid: new Map(),
    isLoading: false,
    error: null,

    getContact: (phoneOrLid: string) => {
        const { contactsByPhone, contactsByLid } = get();

        const normalized = normalizePhone(phoneOrLid);
        if (normalized !== phoneOrLid) {
            return contactsByPhone.get(normalized);
        }

        let contact = contactsByLid.get(phoneOrLid) || contactsByPhone.get(normalized);
        return contact
    },

    setContact: (contact: IContact) => {
        set((state) => {
            const newContactsByPhone = new Map(state.contactsByPhone);
            const newContactsByLid = new Map(state.contactsByLid);

            if (contact.phone_number) {
                const normalized = normalizePhone(contact.phone_number);
                newContactsByPhone.set(normalized, contact);
            }

            if (contact.lid) {
                newContactsByLid.set(contact.lid, contact);
            }

            return {
                contactsByPhone: newContactsByPhone,
                contactsByLid: newContactsByLid,
            };
        });
    },

    setContacts: (contacts: IContact[]) => {
        set((state) => {
            const newContactsByPhone = new Map(state.contactsByPhone);
            const newContactsByLid = new Map(state.contactsByLid);

            for (const contact of contacts) {
                if (contact.phone_number) {
                    const normalized = normalizePhone(contact.phone_number);
                    newContactsByPhone.set(normalized, contact);
                }
                if (contact.lid) {
                    newContactsByLid.set(contact.lid, contact);
                }
            }

            return {
                contactsByPhone: newContactsByPhone,
                contactsByLid: newContactsByLid,
            };
        });
    },

    fetchContact: async (phoneOrLid: string) => {
        const { getContact } = get();
        const existing = getContact(phoneOrLid);
        if (existing) {
            return existing;
        }

        const user = useUserStore.getState().user;
        if (!user?.business_id) {
            console.error('No business_id found for fetching contact');
            return null;
        }

        set({ isLoading: true, error: null });

        // console.log(`[CLIENT] Fetching contact from API: ${phoneOrLid}`);

        try {
            const normalized = normalizePhone(phoneOrLid);
            const isLid = normalized === phoneOrLid || !/\d/.test(phoneOrLid);

            const params = new URLSearchParams({
                business_id: user.business_id.toString(),
            });

            if (isLid) {
                params.set('lid', phoneOrLid);
            } else {
                params.set('phone', normalized);
            }

            const response = await fetch(`/api/contacts/lookup?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch contact');
            }

            const contact: IContact | null = await response.json();

            if (contact) {
                get().setContact(contact);
                // console.log(`[CLIENT] Contact found: ${contact.contact_name || contact.pushname || contact.phone_number || contact.lid}`);
            } else {
                // console.log(`[CLIENT] Contact not found: ${phoneOrLid}`);
            }

            set({ isLoading: false });
            return contact;
        } catch (error) {
            console.error('Error fetching contact:', error);
            const message = error instanceof Error ? error.message : 'Failed to fetch contact';
            set({ error: message, isLoading: false });
            return null;
        }
    },

    fetchContacts: async (phoneOrLids: string[]) => {
        const { contactsByPhone, contactsByLid } = get();

        const normalized = phoneOrLids.map((p) => {
            const n = normalizePhone(p);
            return n === p ? { original: p, normalized: p, isLid: true } : { original: p, normalized: n, isLid: false };
        });

        const toFetch = normalized.filter((p) => {
            if (p.isLid) {
                return !contactsByLid.has(p.normalized);
            }
            return !contactsByPhone.has(p.normalized);
        });

        if (toFetch.length === 0) {
            // console.log(`[CLIENT] All ${phoneOrLids.length} contacts already cached`);
            return;
        }

        // console.log(`[CLIENT] Fetching ${toFetch.length} contacts from API`, toFetch);

        const user = useUserStore.getState().user;
        if (!user?.business_id) {
            console.error('No business_id found for fetching contacts');
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await fetch('/api/contacts/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    business_id: user.business_id,
                    lookups: toFetch.map((p) => ({
                        value: p.isLid ? p.normalized : p.original,
                        is_lid: p.isLid,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch contacts');
            }

            const contacts: IContact[] = await response.json();
            get().setContacts(contacts);
            // console.log(`[CLIENT] Fetched ${contacts.length} contacts from API`);

            set({ isLoading: false });
        } catch (error) {
            console.error('Error fetching contacts:', error);
            const message = error instanceof Error ? error.message : 'Failed to fetch contacts';
            set({ error: message, isLoading: false });
        }
    },

    clearContacts: () => {
        set({ contactsByPhone: new Map(), contactsByLid: new Map(), error: null });
    },
}));
