import { SupabaseClient } from '@supabase/supabase-js';
import { ICampaign } from '../../domain/ICampaign';
import { ICampaignRepository } from '../../domain/ICampaignRepository';
import { Campaign } from '../../domain/Campaign';

export class SupabaseCampaignRepository implements ICampaignRepository {
    private _supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this._supabase = supabase;
    }

    get supabase(): SupabaseClient {
        return this._supabase;
    }

    private mapToCampaign(data: any): ICampaign {
        const payload = data.payload || {};
        const {
            message,
            audienceIds,
            interval,
            day_of_month,
            day_of_week
        } = payload;

        return new Campaign(
            data.id,
            data.name,
            new Date(data.created_at),
            new Date(data.updated_at),
            data.frequency_type,
            payload,
            data.enabled,
            interval || data.interval,
            day_of_month || data.day_of_month,
            day_of_week || data.day_of_week,
            data.cron_expression,
            data.run_at ? new Date(data.run_at) : undefined,
            data.executed_at ? new Date(data.executed_at) : undefined,
            data.description,
            message || data.message,
            audienceIds ? audienceIds.map(Number) : (data.audienceIds ? data.audienceIds.map(Number) : undefined)
        );
    }

    async findById(businessId: number, id: string): Promise<ICampaign | null> {
        const { data, error } = await this.supabase
            .from('scheduled_tasks')
            .select('*')
            .eq('business_id', businessId)
            .eq('task_type', 'message-campaign')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data ? this.mapToCampaign(data) : null;
    }

    async create(businessId: number, campaign: Partial<ICampaign>): Promise<ICampaign> {
        const { data, error } = await this.supabase
            .from('scheduled_tasks')
            .insert({
                ...campaign,
                business_id: businessId,
                task_type: 'message-campaign'
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapToCampaign(data);
    }

    async update(businessId: number, campaign: Partial<ICampaign>): Promise<ICampaign> {
        const { data, error } = await this.supabase
            .from('scheduled_tasks')
            .update(campaign)
            .eq('business_id', businessId)
            .eq('task_type', 'message-campaign')
            .eq('id', campaign.id)
            .select()
            .single();

        if (error) throw error;
        return this.mapToCampaign(data);
    }

    async list(businessId: number, offset: number, limit: number): Promise<ICampaign[]> {
        const { data, error } = await this.supabase
            .from('scheduled_tasks')
            .select('*')
            .eq('business_id', businessId)
            .eq('task_type', 'message-campaign')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return (data || []).map(row => this.mapToCampaign(row));
    }
}
