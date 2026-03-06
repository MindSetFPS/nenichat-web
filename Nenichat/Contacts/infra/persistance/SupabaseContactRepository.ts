import { SupabaseClient } from "@supabase/supabase-js";
import { IContact } from "../../domain/IContact";
import { IContactRepository } from "../../domain/IContactRepository";
import { Contact } from "../../domain/Contact";
import IContactWithLastMessage from "../../app/dtos/IContactWithLastMessage";
import { Message } from "@/Nenichat/Messages/domain/Message";
import { getJidKind } from "../../../Chats/domain/Jid";

/**
 * Supabase select string that always JOINs phone_numbers so the virtual
 * `phone_number` string field is available on every row.
 */
const CONTACT_SELECT = "*, phone_numbers(phone_number)";

export class SupabaseContactRepository implements IContactRepository {
    private _supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this._supabase = supabase;
    }

    get supabase(): SupabaseClient {
        return this._supabase;
    }

    /**
     * Maps a database row (with optional joined phone_numbers) to a Contact domain object.
     */
    private mapToContact(data: any): Contact {
        return new Contact(
            data.id,
            data.business_id,
            data.phone_number_id ?? null,
            // phone_numbers is the joined object from Supabase; fall back gracefully.
            data.phone_numbers?.phone_number ?? null,
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

    /**
     * Looks up or creates a row in the global `phone_numbers` table and returns its id.
     * @param phoneNumber The phone number string to look up or insert.
     * @returns The id of the phone_numbers row.
     */
    private async getOrCreatePhoneNumberId(phoneNumber: string): Promise<number> {
        // Upsert: insert if not exists, return the id regardless.
        const { data, error } = await this.supabase
            .from("phone_numbers")
            .upsert({ phone_number: phoneNumber }, { onConflict: "phone_number" })
            .select("id")
            .single();

        if (error) {
            console.error("Error upserting phone_number:", error);
            throw error;
        }
        return data.id;
    }

    async findById(businessId: number, id: number): Promise<IContact | null> {
        const { data, error } = await this.supabase
            .from("contacts")
            .select(CONTACT_SELECT)
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
            // Use !inner to ensure filtering by phone_numbers.phone_number correctly filters the root contacts rows.
            // Documentation: https://postgrest.org/en/stable/references/api/resource_embedding.html#horizontal-filtering
            .select("*, phone_numbers!inner(phone_number)")
            .eq("business_id", businessId)
            .eq("phone_numbers.phone_number", phoneNumber)
            .maybeSingle();

        if (error) {
            console.error("Error fetching contact by phone number:", JSON.stringify(error, null, 2));
            throw error;
        }
        return data ? this.mapToContact(data) : null;
    }

    async findByLid(businessId: number, lid: string): Promise<IContact | null> {
        const { data, error } = await this.supabase
            .from("contacts")
            .select(CONTACT_SELECT)
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
            .select(CONTACT_SELECT)
            .eq("business_id", businessId)
            .eq("is_user", true)
            .maybeSingle();

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

        // Resolve phone_number_id from the global phone_numbers table if we have a phone string.
        let phoneNumberId = contact.phone_number_id ?? null;
        if (!phoneNumberId && contact.phone_number) {
            phoneNumberId = await this.getOrCreatePhoneNumberId(contact.phone_number);
        }

        // Find existing contact by phone_number_id or lid if no id provided.
        let existingId = contact.id;
        if (!existingId && contact.business_id) {
            let existing: IContact | null = null;
            if (phoneNumberId) {
                const { data } = await this.supabase
                    .from("contacts")
                    .select(CONTACT_SELECT)
                    .eq("business_id", contact.business_id)
                    .eq("phone_number_id", phoneNumberId)
                    .maybeSingle();
                if (data) existing = this.mapToContact(data);
            } else if (contact.lid) {
                existing = await this.findByLid(contact.business_id, contact.lid);
            }
            if (existing) {
                existingId = existing.id;
            }
        }

        // Build the persistable row — exclude virtual `phone_number` string.
        const { phone_number: _virtual, ...rest } = contact as any;
        const contactData: any = {
            ...rest,
            id: existingId,
            phone_number_id: phoneNumberId,
            updated_at: new Date().toISOString(),
        };

        if (!existingId && !contact.created_at) {
            contactData.created_at = new Date().toISOString();
        }

        const { data, error } = await this.supabase
            .from("contacts")
            .upsert(contactData, { onConflict: "id" })
            .select(CONTACT_SELECT)
            .single();

        if (error) {
            console.error("Error in SupabaseContactRepository.save:", error);
            throw error;
        }

        return this.mapToContact(data);
    }

    async saveBatch(contacts: Partial<IContact>[]): Promise<void> {
        if (contacts.length === 0) return;

        // Process individually to handle phone_number_id resolution correctly.
        for (const contact of contacts) {
            await this.save(contact);
        }
    }

    async list(businessId: number, offset: number, limit: number): Promise<IContact[]> {
        const { data, error } = await this.supabase
            .from("contacts")
            .select(CONTACT_SELECT)
            .eq("business_id", businessId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return (data || []).map((d) => this.mapToContact(d));
    }

    async findMergeCandidates(businessId: number, offset: number, limit: number): Promise<{ contacts: IContact[]; total: number }> {
        // A merge candidate is a contact missing either phone_number_id or lid.
        const { data, error, count } = await this.supabase
            .from("contacts")
            .select(CONTACT_SELECT, { count: "exact" })
            .eq("business_id", businessId)
            .or("phone_number_id.is.null,lid.is.null")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return {
            contacts: (data || []).map((d) => this.mapToContact(d)),
            total: count || 0,
        };
    }

    async mergeContacts(businessId: number, primaryContactId: number, secondaryContactIds: number[]): Promise<void> {
        const primaryContact = await this.findById(businessId, primaryContactId);
        if (!primaryContact) throw new Error("Primary contact not found or unauthorized");

        const { data: secondaries, error: fetchError } = await this.supabase
            .from("contacts")
            .select(CONTACT_SELECT)
            .in("id", secondaryContactIds)
            .eq("business_id", businessId);

        if (fetchError) throw fetchError;
        if (!secondaries || secondaries.length !== secondaryContactIds.length) {
            throw new Error("One or more secondary contacts not found");
        }

        const secondaryContacts = secondaries.map((d: any) => this.mapToContact(d));

        // Re-assign related records
        await this.supabase.from("audience_contacts")
            .update({ contact_id: primaryContactId })
            .in("contact_id", secondaryContactIds);

        await this.supabase.from("messages")
            .update({ sender_id: primaryContactId })
            .in("sender_id", secondaryContactIds);

        await this.supabase.from("messages")
            .update({ chat_id: primaryContactId })
            .in("chat_id", secondaryContactIds);

        await this.supabase.from("recipients")
            .update({ contact_id: primaryContactId })
            .in("contact_id", secondaryContactIds);

        // Merge fields from secondaries into primary (first value wins)
        let mergedPhoneNumberId = primaryContact.phone_number_id;
        let mergedLid = primaryContact.lid;
        let mergedUsername = primaryContact.username;
        let mergedPushname = primaryContact.pushname;
        let mergedContactName = primaryContact.contact_name;
        let mergedIsUser = primaryContact.is_user;

        for (const sec of secondaryContacts) {
            if (!mergedPhoneNumberId && sec.phone_number_id) mergedPhoneNumberId = sec.phone_number_id;
            if (!mergedLid && sec.lid) mergedLid = sec.lid;
            if (!mergedUsername && sec.username) mergedUsername = sec.username;
            if (!mergedPushname && sec.pushname) mergedPushname = sec.pushname;
            if (!mergedContactName && sec.contact_name) mergedContactName = sec.contact_name;
            if (sec.is_user) mergedIsUser = true;
        }

        await this.supabase.from("contacts").update({
            phone_number_id: mergedPhoneNumberId,
            lid: mergedLid,
            username: mergedUsername,
            pushname: mergedPushname,
            contact_name: mergedContactName,
            is_user: mergedIsUser,
        }).eq("id", primaryContactId);

        await this.supabase.from("contacts").delete().in("id", secondaryContactIds);
    }

    async getOrCreateContact(businessId: number, contactId: string): Promise<IContact> {
        const jidKind = getJidKind(contactId);
        const isLid = jidKind === "lid" || !contactId.startsWith("521");
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
            is_user: false,
        };
        if (isLid) {
            newContact.lid = contactId;
        } else {
            // `save()` will resolve phone_number_id automatically
            newContact.phone_number = contactId;
        }

        return this.save(newContact);
    }

    async setMe(businessId: number, userId: number): Promise<IContact> {
        await this.supabase.from("contacts")
            .update({ is_user: false })
            .eq("business_id", businessId)
            .eq("is_user", true);

        const { data, error } = await this.supabase.from("contacts")
            .update({ is_user: true })
            .eq("id", userId)
            .select(CONTACT_SELECT)
            .single();

        if (error) throw error;
        return this.mapToContact(data);
    }

    async findRecentContacts(businessId: number, limit: number): Promise<IContact[]> {
        const { data: messages, error } = await this.supabase
            .from("messages")
            .select("sender_id")
            .order("created_at", { ascending: false })
            .limit(limit * 5);

        if (error) throw error;

        const distinctSenderIds = Array.from(
            new Set(messages?.map((m: any) => m.sender_id))
        ).slice(0, limit);

        if (distinctSenderIds.length === 0) return [];

        const { data: contacts, error: contactsError } = await this.supabase
            .from("contacts")
            .select(CONTACT_SELECT)
            .in("id", distinctSenderIds)
            .eq("business_id", businessId);

        if (contactsError) throw contactsError;

        const contactMap = new Map(contacts.map((c: any) => [c.id, c]));
        return distinctSenderIds
            .map((id) => contactMap.get(id))
            .filter(Boolean)
            .map((d: any) => this.mapToContact(d));
    }

    async getContactsWithLastMessage(businessId: number, offset: number, limit: number): Promise<IContactWithLastMessage[]> {
        const { data: messages, error } = await this.supabase
            .from("messages")
            .select("*, chat_id")
            .order("created_at", { ascending: false })
            .limit((offset + limit) * 10);

        if (error) throw error;

        const chats = new Map<number, any>();
        const chatOrder: number[] = [];

        for (const msg of messages || []) {
            if (chats.has(msg.chat_id)) continue;
            chats.set(msg.chat_id, msg);
            chatOrder.push(msg.chat_id);
        }

        const pagedChatIds = chatOrder.slice(offset, offset + limit);
        if (pagedChatIds.length === 0) return [];

        const { data: contactsData, error: contactsError } = await this.supabase
            .from("contacts")
            .select(CONTACT_SELECT)
            .in("id", pagedChatIds)
            .eq("business_id", businessId)
            .eq("is_hidden", false);

        if (contactsError) throw contactsError;

        const result: IContactWithLastMessage[] = [];
        for (const chatId of pagedChatIds) {
            const contactData = contactsData?.find((c: any) => c.id === chatId);
            if (!contactData) continue;

            const msgData = chats.get(chatId);
            const lastMessage = new Message(
                msgData.id,
                msgData.chat_id || msgData.chat_jid || "",
                msgData.sender_id || msgData.sender_jid || "",
                msgData.text_content || msgData.content || null,
                msgData.timestamp || msgData.created_at || "",
                msgData.is_from_me || false,
                msgData.media_type || "",
                msgData.filename || "",
                msgData.url || "",
                msgData.file_length || 0,
                msgData.created_at || "",
                msgData.updated_at || msgData.created_at || "",
                msgData.replied_to_message_id,
                msgData.quoted_message_text
            );

            result.push({
                ...this.mapToContact(contactData),
                last_message: lastMessage,
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
            .from("contacts")
            .select(CONTACT_SELECT)
            .eq("business_id", businessId)
            .eq("is_hidden", true)
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return (data || []).map((d) => this.mapToContact(d));
    }

    async isContactHidden(businessId: number, contactId: number): Promise<boolean> {
        const { data, error } = await this.supabase
            .from("contacts")
            .select("is_hidden")
            .eq("id", contactId)
            .eq("business_id", businessId)
            .maybeSingle();

        if (error) throw error;
        return data?.is_hidden || false;
    }

    async unhideContact(businessId: number, contactId: number): Promise<void> {
        await this.supabase.from("contacts")
            .update({ is_hidden: false })
            .eq("id", contactId)
            .eq("business_id", businessId);
    }

    async count(businessId: number): Promise<number> {
        const { count, error } = await this.supabase
            .from("contacts")
            .select("*", { count: "exact", head: true })
            .eq("business_id", businessId);

        if (error) {
            console.error("Error counting contacts:", JSON.stringify(error, null, 2));
            throw error;
        }
        return count || 0;
    }

    async search(businessId: number, query: string, limit: number): Promise<IContact[]> {
        // Search by contact_name, pushname (stored on contacts), or the resolved phone_number
        // We filter on phone_numbers.phone_number via the join using the Supabase filter syntax.
        const { data, error } = await this.supabase
            .from("contacts")
            .select(CONTACT_SELECT)
            .eq("business_id", businessId)
            .or(
                `contact_name.ilike.%${query}%,pushname.ilike.%${query}%,phone_numbers.phone_number.ilike.%${query}%`
            )
            .limit(limit);

        if (error) {
            console.error("Error searching contacts:", JSON.stringify(error, null, 2));
            throw error;
        }
        return (data || []).map((d) => this.mapToContact(d));
    }
}
