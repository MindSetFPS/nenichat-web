import { SupabaseClient } from '@supabase/supabase-js';
import { IContact } from '@/Nenichat/Contacts/domain/IContact';
import { IAudience } from '../../domain/IAudience';
import { IAudienceContactRepository } from '../../domain/IAudienceContactRepository';
import { supabase as importedSupabase } from "@/lib/supabase";

export class SupabaseAudienceContactRepository implements IAudienceContactRepository {
    private _supabase: SupabaseClient;

    constructor(supabase?: SupabaseClient) {
        this._supabase = supabase || importedSupabase;
    }

    get supabase(): SupabaseClient {
        return this._supabase;
    }

    async findByAudienceId(businessId: number, audienceId: number): Promise<IContact[]> {
        const { data, error } = await this.supabase
            .from('audience_contacts')
            .select('contacts(*)')
            .eq('audience_id', audienceId)
            .eq('contacts.business_id', businessId);

        if (error) throw error;
        return (data || []).map((row: any) => row.contacts).filter(Boolean);
    }

    async findByContactId(businessId: number, contactId: number): Promise<IAudience[]> {
        const { data, error } = await this.supabase
            .from('audience_contacts')
            .select('audiences(*)')
            .eq('contact_id', contactId)
            .eq('audiences.business_id', businessId);

        if (error) throw error;
        return (data || []).map((row: any) => row.audiences).filter(Boolean);
    }

    async findAvailableContacts(businessId: number, audienceId: number): Promise<IContact[]> {
        const { data: contactsInAudience, error: fetchError } = await this.supabase
            .from('audience_contacts')
            .select('contact_id')
            .eq('audience_id', audienceId);

        if (fetchError) throw fetchError;
        const excludedIds = (contactsInAudience || []).map(r => r.contact_id);

        let query = this.supabase
            .from('contacts')
            .select('*')
            .eq('business_id', businessId);

        if (excludedIds.length > 0) {
            query = query.not('id', 'in', `(${excludedIds.join(',')})`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async addContactToAudience(businessId: number, audienceId: number, contactId: number): Promise<void> {
        const { error } = await this.supabase
            .from('audience_contacts')
            .insert({ audience_id: audienceId, contact_id: contactId });

        if (error) throw error;
    }

    async removeContactFromAudience(businessId: number, audienceId: number, contactId: number): Promise<void> {
        const { error } = await this.supabase
            .from('audience_contacts')
            .delete()
            .eq('audience_id', audienceId)
            .eq('contact_id', contactId);

        if (error) throw error;
    }

    async delete(businessId: number, audienceId: number): Promise<void> {
        const { error } = await this.supabase
            .from('audience_contacts')
            .delete()
            .eq('audience_id', audienceId);

        if (error) throw error;
    }

    async updateAudienceMembers(businessId: number, audienceId: number, contactIds: number[]): Promise<void> {
        const { error: deleteError } = await this.supabase
            .from('audience_contacts')
            .delete()
            .eq('audience_id', audienceId);

        if (deleteError) throw deleteError;

        if (contactIds.length > 0) {
            const { error: insertError } = await this.supabase
                .from('audience_contacts')
                .insert(contactIds.map(cid => ({ audience_id: audienceId, contact_id: cid })));

            if (insertError) throw insertError;
        }
    }
}
