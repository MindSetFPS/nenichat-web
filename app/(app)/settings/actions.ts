'use server'

import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBusinessFromUser } from "@/lib/user-auth";

export async function getContactByLidAction(lid: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { business, error: authError } = await getBusinessFromUser(supabase);

        if (authError || !business) {
            throw new Error(authError || 'Unauthorized');
        }

        const contactRepository = new SupabaseContactRepository(supabase);
        const contact = await contactRepository.findByLid(business.id, lid);

        if (!contact) {
            return null;
        }

        return {
            id: contact.id,
            business_id: contact.business_id,
            phone_number: contact.phone_number,
            lid: contact.lid,
            username: contact.username,
            pushname: contact.pushname,
            contact_name: contact.contact_name,
            is_user: contact.is_user,
            is_hidden: contact.is_hidden,
            created_at: contact.created_at instanceof Date ? contact.created_at.toISOString() : contact.created_at,
            updated_at: contact.updated_at instanceof Date ? contact.updated_at.toISOString() : contact.updated_at,
        };
    } catch (error) {
        console.error('Error in getContactByLidAction:', error);
        return null;
    }
}

export async function getContactByPhoneAction(phoneNumber: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { business, error: authError } = await getBusinessFromUser(supabase);

        if (authError || !business) {
            throw new Error(authError || 'Unauthorized');
        }

        const contactRepository = new SupabaseContactRepository(supabase);
        const contact = await contactRepository.findByPhoneNumber(business.id, phoneNumber);

        if (!contact) {
            return null;
        }

        return {
            id: contact.id,
            business_id: contact.business_id,
            phone_number: contact.phone_number,
            lid: contact.lid,
            username: contact.username,
            pushname: contact.pushname,
            contact_name: contact.contact_name,
            is_user: contact.is_user,
            is_hidden: contact.is_hidden,
            created_at: contact.created_at instanceof Date ? contact.created_at.toISOString() : contact.created_at,
            updated_at: contact.updated_at instanceof Date ? contact.updated_at.toISOString() : contact.updated_at,
        };
    } catch (error) {
        console.error('Error in getContactByPhoneAction:', error);
        return null;
    }
}

export async function getMyContactAction() {
    try {
        const supabase = await createServerSupabaseClient();
        const { business, error: authError } = await getBusinessFromUser(supabase);

        if (authError || !business) {
            throw new Error(authError || 'Unauthorized');
        }

        const contactRepository = new SupabaseContactRepository(supabase);
        const contact = await contactRepository.findMe(business.id);

        if (!contact) {
            return null;
        }

        return {
            id: contact.id,
            business_id: contact.business_id,
            phone_number: contact.phone_number,
            lid: contact.lid,
            username: contact.username,
            pushname: contact.pushname,
            contact_name: contact.contact_name,
            is_user: contact.is_user,
            is_hidden: contact.is_hidden,
            created_at: contact.created_at instanceof Date ? contact.created_at.toISOString() : contact.created_at,
            updated_at: contact.updated_at instanceof Date ? contact.updated_at.toISOString() : contact.updated_at,
        };
    } catch (error) {
        console.error('Error in getMyContactAction:', error);
        return null;
    }
}

export async function setContactAsUserAction(phoneNumber: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { business, error: authError } = await getBusinessFromUser(supabase);

        if (authError || !business) {
            throw new Error(authError || 'Unauthorized');
        }

        const contactRepository = new SupabaseContactRepository(supabase);

        const contact = await contactRepository.findByPhoneNumber(business.id, phoneNumber);
        
        if (!contact || !contact.id) {
            return { success: false, error: 'Contact not found' };
        }

        await contactRepository.setMe(business.id, contact.id);

        return { success: true };
    } catch (error) {
        console.error('Error in setContactAsUserAction:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Server action to fetch hidden contacts.
 * @param offset The offset for pagination.
 * @param limit The number of contacts to fetch.
 * @returns A promise that resolves to the hidden contacts.
 */
export async function getHiddenContactsAction(offset: number = 0, limit: number = 10) {
    try {
        const supabase = await createServerSupabaseClient();
        const { business, error: authError } = await getBusinessFromUser(supabase);

        if (authError || !business) {
            throw new Error(authError || 'Unauthorized');
        }

        const contactRepository = new SupabaseContactRepository(supabase);
        const hiddenContacts = await contactRepository.getHiddenContacts(business.id, offset, limit);

        return hiddenContacts
            .filter(c => c.id !== undefined && c.id !== null)
            .map(contact => ({
                id: contact.id,
                business_id: contact.business_id,
                phone_number: contact.phone_number,
                lid: contact.lid,
                username: contact.username,
                pushname: contact.pushname,
                contact_name: contact.contact_name,
                is_user: contact.is_user,
                is_hidden: contact.is_hidden,
                created_at: contact.created_at instanceof Date ? contact.created_at.toISOString() : contact.created_at,
                updated_at: contact.updated_at instanceof Date ? contact.updated_at.toISOString() : contact.updated_at,
            }));
    } catch (error) {
        console.error('Error in getHiddenContactsAction:', error);
        throw new Error('Failed to fetch hidden contacts');
    }
}
