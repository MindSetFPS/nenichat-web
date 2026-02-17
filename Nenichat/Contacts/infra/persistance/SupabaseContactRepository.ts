import { supabase as importedSupabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { IContact } from "../../domain/IContact";
import { IContactRepository } from "../../domain/IContactRepository";
import { Contact } from "../../domain/Contact";
import IContactWithLastMessage from "../../app/dtos/IContactWithLastMessage";
import { Message } from "@/Nenichat/Messages/domain/Message";

export class SupabaseContactRepository implements IContactRepository {
    private _supabase: SupabaseClient;

    constructor(supabase?: SupabaseClient) {
        this._supabase = supabase || importedSupabase;
    }

    get supabase(): SupabaseClient {
        return this._supabase;
    }

    private mapToContact(data: any): Contact {
        return new Contact(
            data.id,
            data.business_id,
            data.phone_number,
            data.lid,
            data.username,
            data.pushname,
            data.contact_name,
            data.is_user,
            new Date(data.created_at),
            new Date(data.updated_at)
        );
    }

    async findById(id: number): Promise<IContact | null> {
        const { data, error } = await this.supabase
            .from("contacts")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") return null;
            console.error("Error fetching contact by ID:", error);
            throw error;
        }
        return this.mapToContact(data);
    }

    async findByPhoneNumber(businessId: number, phoneNumber: string): Promise<IContact | null> {
        const { data, error } = await this.supabase
            .from("contacts")
            .select("*")
            .eq("business_id", businessId)
            .eq("phone_number", phoneNumber)
            .maybeSingle();

        if (error) {
            console.error("Error fetching contact by phone number:", error);
            throw error;
        }
        return data ? this.mapToContact(data) : null;
    }

    async findByLid(businessId: number, lid: string): Promise<IContact | null> {
        const { data, error } = await this.supabase
            .from("contacts")
            .select("*")
            .eq("business_id", businessId)
            .eq("lid", lid)
            .maybeSingle();

        if (error) {
            console.error("Error fetching contact by LID:", error);
            throw error;
        }
        return data ? this.mapToContact(data) : null;
    }

    async findMe(businessId: number): Promise<IContact | null> {
        const { data, error } = await this.supabase
            .from("contacts")
            .select("*")
            .eq("business_id", businessId)
            .eq("is_user", true)
            .maybeSingle(); // Use maybeSingle to avoid error if multiple (though unexpected) or none

        console.log("data", data)
        console.log("error", error)

        if (error) {
            console.error("Error fetching 'me' contact:", error);
            throw error;
        }
        return data ? this.mapToContact(data) : null;
    }

    async save(contact: Partial<IContact>): Promise<IContact> {
        if (!contact.business_id && !contact.id) {
            throw new Error("Business ID is required for creating a contact");
        }

        // Prepare data for upsert/update/insert
        const contactData: any = {
            ...contact,
            updated_at: new Date().toISOString(),
        };

        // If it's a new record creation, ensure created_at is set if not provided
        if (!contact.id && !contact.created_at) {
            contactData.created_at = new Date().toISOString();
        }

        // Simplified save logic leveraging upsert if ID is present or check logic
        // However, existing logic checks phone/lid first to prevent duplicates.
        // Supabase upsert on ID works if ID is known. If not, we rely on constraints or logic.
        // The previous implementation had complex logic to find existing by phone/lid.

        let existingId = contact.id;
        if (!existingId && contact.business_id) {
            if (contact.phone_number) {
                const existing = await this.findByPhoneNumber(contact.business_id, contact.phone_number);
                if (existing) existingId = existing.id ?? undefined;
            }
            if (!existingId && contact.lid) {
                const existing = await this.findByLid(contact.business_id, contact.lid);
                if (existing) existingId = existing.id ?? undefined;
            }
        }

        if (existingId) {
            // Update
            const { data, error } = await this.supabase
                .from("contacts")
                .update(contactData)
                .eq("id", existingId)
                .select()
                .single();

            if (error) throw error;
            return this.mapToContact(data);
        } else {
            // Create
            const { data, error } = await this.supabase
                .from("contacts")
                .insert(contactData)
                .select()
                .single();

            if (error) throw error;
            return this.mapToContact(data);
        }
    }

    async saveBatch(contacts: Partial<IContact>[]): Promise<void> {
        if (contacts.length === 0) return;

        const contactsData = contacts.map(contact => ({
            ...contact,
            updated_at: new Date().toISOString(),
            created_at: contact.created_at ? contact.created_at.toISOString() : undefined // Let DB handle default if undefined, but batch insert might need explicit or default handling if not all rows have it? Supabase handles defaults.
        }));

        // split into phone and lid based upserts if necessary, but Supabase upsert takes 'onConflict'.
        // Postgres repo splits them. We can do the same.
        const phoneContacts = contactsData.filter(c => c.phone_number);
        const lidContacts = contactsData.filter(c => c.lid && !c.phone_number);

        if (phoneContacts.length > 0) {
            const { error } = await this.supabase
                .from("contacts")
                .upsert(phoneContacts, { onConflict: 'phone_number' }); // Provided business_id is part of constraint? No, logic assumes phone unique globally or we rely on constraints. Original SQL used ON CONFLICT (phone_number).
            if (error) throw error;
        }

        if (lidContacts.length > 0) {
            const { error } = await this.supabase
                .from("contacts")
                .upsert(lidContacts, { onConflict: 'lid' });
            if (error) throw error;
        }
    }

    async list(businessId: number, offset: number, limit: number): Promise<IContact[]> {
        const { data, error } = await this.supabase
            .from("contacts")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return (data || []).map(this.mapToContact);
    }

    async findMergeCandidates(businessId: number, offset: number, limit: number): Promise<{ contacts: IContact[]; total: number }> {
        // Supabase doesn't support OR across different columns easily with simple query builder for (a IS NULL OR b IS NULL) AND business_id = x.
        // We can use .or().

        // Logic: business_id = $1 AND (phone_number IS NULL OR lid IS NULL)

        const { data, error, count } = await this.supabase
            .from("contacts")
            .select("*", { count: 'exact' })
            .eq("business_id", businessId)
            .or('phone_number.is.null,lid.is.null')
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return {
            contacts: (data || []).map(this.mapToContact),
            total: count || 0
        };
    }

    async mergeContacts(primaryContactId: number, secondaryContactIds: number[]): Promise<void> {
        // NOTE: Client-side implementation without transaction atomicity.
        // Ideally should be an RPC.

        const primaryContact = await this.findById(primaryContactId);
        if (!primaryContact) throw new Error("Primary contact not found");

        // Fetch secondaries
        const { data: secondaries, error: fetchError } = await this.supabase
            .from("contacts")
            .select("*")
            .in("id", secondaryContactIds);

        if (fetchError) throw fetchError;
        if (!secondaries || secondaries.length !== secondaryContactIds.length) {
            throw new Error("One or more secondary contacts not found");
        }

        // Update related tables
        const tablesToUpdate = ['audience_contacts', 'messages', 'recipients'];
        // 'messages' needs both sender_id and chat_id updates.

        // Update audience_contacts
        await this.supabase.from('audience_contacts')
            .update({ contact_id: primaryContactId })
            .in('contact_id', secondaryContactIds);

        // Update messages sender_id
        await this.supabase.from('messages')
            .update({ sender_id: primaryContactId })
            .in('sender_id', secondaryContactIds);

        // Update messages chat_id
        await this.supabase.from('messages')
            .update({ chat_id: primaryContactId })
            .in('chat_id', secondaryContactIds);

        // Update recipients
        await this.supabase.from('recipients')
            .update({ contact_id: primaryContactId })
            .in('contact_id', secondaryContactIds);

        // Merge logic
        let mergedData: any = { ...primaryContact };

        for (const sec of secondaries) {
            if (!mergedData.phone_number && sec.phone_number) mergedData.phone_number = sec.phone_number;
            if (!mergedData.lid && sec.lid) mergedData.lid = sec.lid;
            if (!mergedData.username && sec.username) mergedData.username = sec.username;
            if (!mergedData.pushname && sec.pushname) mergedData.pushname = sec.pushname;
            if (!mergedData.contact_name && sec.contact_name) mergedData.contact_name = sec.contact_name;
            if (sec.is_user) mergedData.is_user = true;
            // Dates logic simplified: keep primary's or update? Original kept min created, max updated.
        }

        // Update primary
        await this.supabase.from('contacts').update(mergedData).eq('id', primaryContactId);

        // Delete secondaries
        await this.supabase.from('contacts').delete().in('id', secondaryContactIds);
    }

    async getOrCreateContact(businessId: number, contactId: string): Promise<IContact> {
        const isLid = contactId.endsWith("@lid") || !contactId.startsWith("521");
        let contact: IContact | null = null;

        if (isLid) {
            contact = await this.findByLid(businessId, contactId);
        }

        if (!contact && !isLid) {
            contact = await this.findByPhoneNumber(businessId, contactId);
        }

        if (contact) return contact;

        const newContact: Partial<IContact> = {
            business_id: businessId,
            is_user: false
        };
        if (isLid) newContact.lid = contactId;
        else newContact.phone_number = contactId;

        return this.save(newContact);
    }

    async setMe(userId: number): Promise<IContact> {
        const contact = await this.findById(userId);
        if (!contact) throw new Error("Contact not found");

        // Set all others to false
        await this.supabase.from('contacts')
            .update({ is_user: false })
            .eq('business_id', contact.business_id)
            .eq('is_user', true);

        // Set this one to true
        const { data, error } = await this.supabase.from('contacts')
            .update({ is_user: true })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return this.mapToContact(data);
    }

    async findRecentContacts(businessId: number, limit: number): Promise<IContact[]> {
        // Complex query: contacts with most recent messages.
        // Approximation: fetch recent distinct messages, then fetch contacts.

        // We need to group by sender_id (or chat_id depending on meaning) and order by max created_at.
        // Supabase JS doesn't support group by + order by aggregation easily without RPC.
        // Fallback: Fetch messages ordered by date, distinct on client/DB?

        // We can create a view or RPC, but constrained to client-side:
        const { data: messages, error } = await this.supabase
            .from('messages')
            .select('sender_id')
            .order('created_at', { ascending: false })
            .limit(limit * 5); // Fetch more to account for duplicates

        if (error) throw error;

        const distinctSenderIds = Array.from(new Set(messages?.map((m: any) => m.sender_id))).slice(0, limit);

        if (distinctSenderIds.length === 0) return [];

        const { data: contacts, error: contactsError } = await this.supabase
            .from('contacts')
            .select('*')
            .in('id', distinctSenderIds)
            .eq('business_id', businessId);

        if (contactsError) throw contactsError;

        // Re-sort to match message order
        const contactMap = new Map(contacts.map(c => [c.id, c]));
        return distinctSenderIds.map(id => contactMap.get(id)).filter(Boolean).map(this.mapToContact);
    }

    async getContactsWithLastMessage(businessId: number, offset: number, limit: number): Promise<IContactWithLastMessage[]> {
        // Approximation: Fetch recent messages to identify active chats.
        // This is inefficient for deep paging but standard for "recent chats" view.

        // Get hidden contacts first
        const hiddenContacts = await this.getHiddenContacts(businessId, 0, 1000); // Reasonable limit?
        const hiddenIds = new Set(hiddenContacts.map(c => c.id));

        // Fetch distinct chat_ids from messages table ordered by created_at desc.
        // Not supported directly.
        // RPC 'get_conversations' would be ideal.
        // Without RPC: Fetch messages, client-side distinct. 
        // Issue: pagination is on "conversations", but we seek on "messages".
        // We might overfetch.

        const { data: messages, error } = await this.supabase
            .from('messages')
            .select('*, chat_id')
            .order('created_at', { ascending: false })
            .limit((offset + limit) * 10); // Heuristic multiplier

        if (error) throw error;

        const chats = new Map<number, any>();
        const chatOrder: number[] = [];

        for (const msg of (messages || [])) {
            if (chats.has(msg.chat_id)) continue;
            if (hiddenIds.has(msg.chat_id)) continue;

            // Verify business_id of contact (chat_id) by fetching? 
            // Or rely on later fetch. 
            // We'll filter later.

            chats.set(msg.chat_id, msg);
            chatOrder.push(msg.chat_id);
        }

        // Apply pagination
        const pagedChatIds = chatOrder.slice(offset, offset + limit);

        if (pagedChatIds.length === 0) return [];

        const { data: contactsData, error: contactsError } = await this.supabase
            .from('contacts')
            .select('*')
            .in('id', pagedChatIds)
            .eq('business_id', businessId);

        if (contactsError) throw contactsError;

        const result: IContactWithLastMessage[] = [];
        for (const chatId of pagedChatIds) {
            const contactData = contactsData?.find((c: any) => c.id === chatId);
            if (!contactData) continue; // Might belong to another business or deleted

            const msgData = chats.get(chatId);
            const lastMessage = new Message(
                msgData.id,
                msgData.chat_id,
                msgData.sender_id,
                msgData.text_content,
                msgData.replied_to_message_id,
                msgData.quoted_message_text,
                new Date(msgData.created_at)
            );

            result.push({
                ...this.mapToContact(contactData),
                last_message: lastMessage
            });
        }

        return result;
    }

    async hideContact(contactIdToHide: number): Promise<void> {
        const me = await this.findMeByContactId(contactIdToHide);
        if (!me) throw new Error("Current user not found for this contact context");

        const { error } = await this.supabase.from("hidden_contacts")
            .upsert(
                { user_contact_id: me.id, hidden_contact_id: contactIdToHide },
                { onConflict: 'user_contact_id, hidden_contact_id', ignoreDuplicates: true }
            );

        if (error) throw error;
    }

    // Helper to find 'me' in the same business context as a contact
    private async findMeByContactId(contactId: number): Promise<IContact | null> {
        const contact = await this.findById(contactId);
        if (!contact) return null;
        return this.findMe(contact.business_id);
    }

    async getHiddenContacts(businessId: number, offset: number, limit: number): Promise<IContact[]> {
        const me = await this.findMe(businessId);
        if (!me) return [];

        const { data, error } = await this.supabase
            .from('hidden_contacts')
            .select('hidden_contact_id')
            .eq('user_contact_id', me.id)
            .range(offset, offset + limit - 1);

        if (error) throw error;

        const ids = data?.map((r: any) => r.hidden_contact_id) || [];
        if (ids.length === 0) return [];

        const { data: contacts, error: cError } = await this.supabase
            .from('contacts')
            .select('*')
            .in('id', ids);

        if (cError) throw cError;
        return (contacts || []).map(this.mapToContact);
    }

    async isContactHidden(contactId: number): Promise<boolean> {
        const me = await this.findMeByContactId(contactId);
        if (!me) return false;

        const { data, error } = await this.supabase
            .from('hidden_contacts')
            .select('id')
            .eq('user_contact_id', me.id)
            .eq('hidden_contact_id', contactId)
            .maybeSingle();

        if (error) throw error;
        return !!data;
    }

    async unhideContact(contactId: number): Promise<void> {
        const me = await this.findMeByContactId(contactId);
        if (!me) return;

        await this.supabase.from('hidden_contacts')
            .delete()
            .eq('user_contact_id', me.id)
            .eq('hidden_contact_id', contactId);
    }
}
