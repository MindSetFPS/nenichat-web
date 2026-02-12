'use server'

import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { requireAuth } from "@/lib/auth";

/**
 * Server action to fetch hidden contacts.
 * @param offset The offset for pagination.
 * @param limit The number of contacts to fetch.
 * @returns A promise that resolves to the hidden contacts.
 */
export async function getHiddenContactsAction(offset: number = 0, limit: number = 10) {
    try {
        await requireAuth();
        const hiddenContacts = await contactRepository.getHiddenContacts(offset, limit);

        // Serialize for client (ensure bigint or other non-serializable types are handled if necessary)
        // The Contact objects might have bigint IDs. Let's ensure they are strings or numbers.
        return hiddenContacts.filter(c => c.id !== undefined && c.id !== null).map(contact => ({
            ...contact,
            id: contact.id!.toString()
        }));
    } catch (error) {
        console.error('Error in getHiddenContactsAction:', error);
        throw new Error('Failed to fetch hidden contacts');
    }
}
