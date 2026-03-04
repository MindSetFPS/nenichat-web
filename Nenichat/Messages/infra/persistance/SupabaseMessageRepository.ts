import { supabase as importedSupabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { IMessage } from "../../domain/IMessage";
import { IMessageRepository } from "../../domain/IMessageRepository";
import { Message } from "../../domain/Message";
import { IMessageWithSender } from "../../domain/IMessageWithSender";
import { IMessagesReport } from "../../domain/IMessagesReport";

/**
 * Repository implementation for managing messages using Supabase.
 */
export class SupabaseMessageRepository implements IMessageRepository {
    private _supabase: SupabaseClient;

    /**
     * Initializes a new instance of the SupabaseMessageRepository.
     * @param supabase Optional Supabase client instance. If not provided, the default imported client is used.
     */
    constructor(supabase?: SupabaseClient) {
        this._supabase = supabase || importedSupabase;
    }

    /**
     * Gets the Supabase client instance.
     */
    get supabase(): SupabaseClient {
        return this._supabase;
    }

    /**
     * Maps database message data to a Message domain object.
     * @param data The raw message data from the database.
     * @returns A Message domain object.
     * @private
     */
    private mapToMessage(data: any): Message {
        return new Message(
            data.id,
            data.chat_id || data.chat_jid || '',
            data.sender_id || data.sender_jid || '',
            data.text_content || data.content || '',
            data.timestamp || data.created_at || '',
            data.is_from_me || false,
            data.media_type || '',
            data.filename || '',
            data.url || '',
            data.file_length || 0,
            data.created_at || '',
            data.updated_at || '',
            data.replied_to_message_id,
            data.quoted_message_text
        );
    }

    /**
     * Finds a message by its ID.
     * @param id The message ID.
     * @returns A promise that resolves to the message if found, or null otherwise.
     */
    async findById(id: string): Promise<IMessage | null> {
        const { data, error } = await this.supabase
            .from("messages")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) {
            console.error("Error fetching message by ID:", error);
            throw error;
        }
        return data ? this.mapToMessage(data) : null;
    }

    /**
     * Saves a message to the database (updates if ID exists, inserts otherwise).
     * @param message The message data to save.
     * @returns A promise that resolves to the saved message.
     */
    async save(message: Partial<IMessage>): Promise<IMessage> {
        const { data, error } = await this.supabase
            .from("messages")
            .upsert({
                ...message,
                created_at: message.created_at ? message.created_at : new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error("Error saving message:", error);
            throw error;
        }
        return this.mapToMessage(data);
    }

    /**
     * Lists messages with pagination.
     * @param offset The number of records to skip.
     * @param limit The maximum number of records to return.
     * @returns A promise that resolves to an array of messages.
     */
    async list(offset: number, limit: number): Promise<IMessage[]> {
        const { data, error } = await this.supabase
            .from("messages")
            .select("*")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return (data || []).map(this.mapToMessage);
    }

    /**
     * Lists messages with their senders. Not implemented for Supabase yet.
     * @param offset The number of records to skip.
     * @param limit The maximum number of records to return.
     */
    async listWithSender(offset: number, limit: number): Promise<IMessageWithSender[]> {
        throw new Error("Method not implemented.");
    }

    /**
     * Finds messages by chat ID with pagination.
     * @param chat_id The chat ID.
     * @param offset The number of records to skip.
     * @param limit The maximum number of records to return.
     * @returns A promise that resolves to an array of messages.
     */
    async findByChatId(chat_id: string, offset: number, limit: number): Promise<IMessage[]> {
        const { data, error } = await this.supabase
            .from("messages")
            .select("*")
            .eq("chat_id", chat_id)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return (data || []).map(this.mapToMessage);
    }

    /**
     * Finds messages by chat ID with their senders. Not implemented for Supabase yet.
     * @param chat_id The chat ID.
     * @param offset The number of records to skip.
     * @param limit The maximum number of records to return.
     */
    async findByChatIdWithSender(chat_id: string, offset: number, limit: number): Promise<IMessageWithSender[]> {
        throw new Error("Method not implemented.");
    }

    /**
     * Counts the total number of messages.
     * @returns A promise that resolves to the total count.
     */
    async count(): Promise<number> {
        const { count, error } = await this.supabase
            .from("messages")
            .select("*", { count: 'exact', head: true });

        if (error) throw error;
        return count || 0;
    }

    /**
     * Reports message counts per day. Not implemented for Supabase yet.
     * @param interval The number of days to look back.
     */
    async getMessageCountPerDay(interval: number): Promise<IMessagesReport[]> {
        throw new Error("Method not implemented.");
    }

    /**
     * Gets the last message for a specific chat.
     * @param chat_id The chat ID.
     * @returns A promise that resolves to the last message if found, or null otherwise.
     */
    async getLastContactMessage(chat_id: number): Promise<IMessage | null> {
        const { data, error } = await this.supabase
            .from("messages")
            .select("*")
            .eq("chat_id", chat_id)
            .order("created_at", { ascending: false })
            .order("id", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("Error fetching last contact message:", error);
            throw error;
        }
        return data ? this.mapToMessage(data) : null;
    }

    async getLastContactMessageByPhone(phone_number: string): Promise<IMessage | null> {
        const { data, error } = await this.supabase
            .from("messages")
            .select("*")
            .or(`chat_id.eq.${phone_number},chat_jid.eq.${phone_number}`)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("Error fetching last contact message by phone:", error);
            throw error;
        }
        return data ? this.mapToMessage(data) : null;
    }

    async getLastContactMessageByLid(lid: string): Promise<IMessage | null> {
        const { data, error } = await this.supabase
            .from("messages")
            .select("*")
            .or(`chat_id.eq.${lid},chat_jid.eq.${lid}`)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("Error fetching last contact message by lid:", error);
            throw error;
        }
        return data ? this.mapToMessage(data) : null;
    }
}
