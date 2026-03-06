import { SupabaseClient } from '@supabase/supabase-js';
import { IAudience } from '../../domain/IAudience';
import { IAudienceRepository } from '../../domain/IAudienceRepository';

export class SupabaseAudienceRepository implements IAudienceRepository {
    private _supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this._supabase = supabase;
    }

    get supabase(): SupabaseClient {
        return this._supabase;
    }

    async findById(businessId: number, id: number): Promise<IAudience | null> {
        const { data, error } = await this.supabase
            .from('audiences')
            .select('*')
            .eq('business_id', businessId)
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async getByIds(businessId: number, ids: number[]): Promise<IAudience[]> {
        const { data, error } = await this.supabase
            .from('audiences')
            .select('*')
            .eq('business_id', businessId)
            .in('id', ids);

        if (error) throw error;
        return data || [];
    }

    async findAll(businessId: number): Promise<IAudience[]> {
        const { data, error } = await this.supabase
            .from('audiences')
            .select('*')
            .eq('business_id', businessId)
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async delete(businessId: number, id: number): Promise<void> {
        const { error } = await this.supabase
            .from('audiences')
            .delete()
            .eq('business_id', businessId)
            .eq('id', id);

        if (error) throw error;
    }

    async create(businessId: number, audience: Omit<IAudience, 'id' | 'business_id' | 'created_at'>): Promise<IAudience> {
        const { data, error } = await this.supabase
            .from('audiences')
            .insert({ ...audience, business_id: businessId })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
