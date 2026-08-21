import { SupabaseClient } from '@supabase/supabase-js';
import { ITemplate } from '../../domain/ITemplate';
import { ITemplateRepository } from '../../domain/ITemplateRepository';
import { Template } from '../../domain/Template';

export class SupabaseTemplateRepository implements ITemplateRepository {
  private _supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this._supabase = supabase;
  }

  private mapToTemplate(data: any): ITemplate {
    return new Template({
      id: data.id,
      business_id: data.business_id,
      name: data.name,
      message: data.message,
      created_at: data.created_at,
      updated_at: data.updated_at,
    });
  }

  async list(businessId: number): Promise<ITemplate[]> {
    const { data, error } = await this._supabase
      .from('message_templates')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(row => this.mapToTemplate(row));
  }

  async findById(businessId: number, id: string): Promise<ITemplate | null> {
    const { data, error } = await this._supabase
      .from('message_templates')
      .select('*')
      .eq('business_id', businessId)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapToTemplate(data) : null;
  }

  async create(businessId: number, data: { name: string; message: string }): Promise<ITemplate> {
    const { data: created, error } = await this._supabase
      .from('message_templates')
      .insert({ business_id: businessId, name: data.name, message: data.message })
      .select()
      .single();

    if (error) throw error;
    return this.mapToTemplate(created);
  }

  async update(businessId: number, id: string, data: { name: string; message: string }): Promise<ITemplate> {
    const { data: updated, error } = await this._supabase
      .from('message_templates')
      .update({ name: data.name, message: data.message, updated_at: new Date().toISOString() })
      .eq('business_id', businessId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToTemplate(updated);
  }

  async delete(businessId: number, id: string): Promise<void> {
    const { error } = await this._supabase
      .from('message_templates')
      .delete()
      .eq('business_id', businessId)
      .eq('id', id);

    if (error) throw error;
  }
}
