import { supabase as importedSupabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { IContact } from "../../domain/IContact";
import { IContactRepository } from "../../domain/IContactRepository";
import { Contact } from "../../domain/Contact";
import IContactWithLastMessage from "../../app/dtos/IContactWithLastMessage";
import { Message } from "@/Nenichat/Messages/domain/Message";
import { getJidKind } from "../../../Chats/domain/Jid";

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
            data.is_hidden || false,
            new Date(data.created_at),
            new Date(data.updated_at)
        );
    }

    async findById(businessId: number, id: number): Promise<IContact | null> {
        const { data, error } = await this.supabase
            .from("contacts")
            .select("*")
            .eq("business_id", businessId)
            .eq("id", id)
            .maybeSingle();

        if (error) {
            console.error("Error fetching contact by ID:", error);
            throw error;
        }
        return data ? this.mapToContact(data) : null;
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

        if (error) {
            console.error("Error fetching 'me' contact:", error);
            throw error;
        }
        return data ? this.mapToContact(data) : null;
    }

    async save(contact: Partial<IContact>): Promise<IContact> {
        if (!contact.business_id && !contact.id) {
            throw new Error("Business ID is required for saving a contact");
        }

        // To handle the "no unique constraint" error (42P10), we find the existing ID first
        // if it's not provided, then we can always upsert on the 'id' (Primary Key).
        let existingId = contact.id;
        if (!existingId && contact.business_id) {
            let existing: IContact | null = null;
            if (contact.phone_number) {
                existing = await this.findByPhoneNumber(contact.business_id, contact.phone_number);
            } else if (contact.lid) {
                existing = await this.findByLid(contact.business_id, contact.lid);
            }
            if (existing) {
                existingId = existing.id;
            }
        }

        const contactData: any = {
            ...contact,
            id: existingId,
            updated_at: new Date().toISOString(),
        };

        if (!existingId && !contact.created_at) {
            contactData.created_at = new Date().toISOString();
        }

        // We now always upsert on 'id'. If lid/phone match an existing record, 
        // we've already retrieved the correct ID above.
        const { data, error } = await this.supabase
            .from("contacts")
            .upsert(contactData, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error("Error in SupabaseContactRepository.save:", error);
            throw error;
        }

        return this.mapToContact(data);
    }

    async saveBatch(contacts: Partial<IContact>[]): Promise<void> {
        if (contacts.length === 0) return;

        // For batch operations, if we can't guarantee a unique constraint on lid/phone, 
        // we should ideally use an RPC or process them one by one/in chunks with mapped IDs.
        // Since Supabase upsert requires a matching constraint for the 'onConflict' target,
        // and 'lid' is missing it, we'll process these individually or use phone_number where available.

        for (const contact of contacts) {
            await this.save(contact);
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

    async mergeContacts(businessId: number, primaryContactId: number, secondaryContactIds: number[]): Promise<void> {
        // NOTE: Client-side implementation without transaction atomicity.
        // Ideally should be an RPC.

        const primaryContact = await this.findById(businessId, primaryContactId);
        if (!primaryContact) throw new Error("Primary contact not found or unauthorized");

        // Fetch secondaries
        const { data: secondaries, error: fetchError } = await this.supabase
            .from("contacts")
            .select("*")
            .in("id", secondaryContactIds)
            .eq("business_id", businessId);

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
        const jidKind = getJidKind(contactId);
        const isLid = jidKind === 'lid' || !contactId.startsWith("521");
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

    async setMe(businessId: number, userId: number): Promise<IContact> {
        // Set all others to false
        await this.supabase.from('contacts')
            .update({ is_user: false })
            .eq('business_id', businessId)
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
            .eq('business_id', businessId)
            .eq('is_hidden', false);

        if (contactsError) throw contactsError;

        const result: IContactWithLastMessage[] = [];
        for (const chatId of pagedChatIds) {
            const contactData = contactsData?.find((c: any) => c.id === chatId);
            if (!contactData) continue; // Might belong to another business or deleted

            const msgData = chats.get(chatId);
            const lastMessage = new Message(
                msgData.id,
                msgData.chat_id || msgData.chat_jid || '',
                msgData.sender_id || msgData.sender_jid || '',
                msgData.text_content || msgData.content || null,
                msgData.timestamp || msgData.created_at || '',
                msgData.is_from_me || false,
                msgData.media_type || '',
                msgData.filename || '',
                msgData.url || '',
                msgData.file_length || 0,
                msgData.created_at || '',
                msgData.updated_at || msgData.created_at || '',
                msgData.replied_to_message_id,
                msgData.quoted_message_text
            );

            result.push({
                ...this.mapToContact(contactData),
                last_message: lastMessage
            });
        }

        return result;
    }

    async hideContact(businessId: number, contactIdToHide: number): Promise<void> {
        const { error } = await this.supabase.from("contacts")
            .update({ is_hidden: true })
            .eq("id", contactIdToHide)
            .eq("business_id", businessId);

        if (error) throw error;
    }

    async getHiddenContacts(businessId: number, offset: number, limit: number): Promise<IContact[]> {
        const { data, error } = await this.supabase
            .from('contacts')
            .select('*')
            .eq('business_id', businessId)
            .eq('is_hidden', true)
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return (data || []).map(this.mapToContact);
    }

    async isContactHidden(businessId: number, contactId: number): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('contacts')
            .select('is_hidden')
            .eq('id', contactId)
            .eq('business_id', businessId)
            .maybeSingle();

        if (error) throw error;
        return data?.is_hidden || false;
    }

    async unhideContact(businessId: number, contactId: number): Promise<void> {
        await this.supabase.from('contacts')
            .update({ is_hidden: false })
            .eq('id', contactId)
            .eq('business_id', businessId);
    }

    async count(businessId: number): Promise<number> {
        const { count, error } = await this.supabase
            .from("contacts")
            .select("*", { count: 'exact', head: true })
            .eq("business_id", businessId);

        if (error) {
            console.error("Error counting contacts:", error);
            throw error;
        }
        return count || 0;
    }

    async search(businessId: number, query: string, limit: number): Promise<IContact[]> {
        const { data, error } = await this.supabase
            .from("contacts")
            .select("*")
            .eq("business_id", businessId)
            .or(`contact_name.ilike.%${query}%,phone_number.ilike.%${query}%,pushname.ilike.%${query}%`)
            .limit(limit);

        if (error) throw error;
        return (data || []).map(this.mapToContact);
    }
}
