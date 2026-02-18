import { SupabaseClient } from '@supabase/supabase-js';
import { IExpenseCategory } from '../../domain/IExpenseCategory';
import { IExpenseCategoryRepository } from '../../domain/IExpenseCategoryRepository';
import { supabase as importedSupabase } from "@/lib/supabase";

export class SupabaseExpenseCategoryRepository implements IExpenseCategoryRepository {
    private _supabase: SupabaseClient;

    constructor(supabase?: SupabaseClient) {
        this._supabase = supabase || importedSupabase;
    }

    get supabase(): SupabaseClient {
        return this._supabase;
    }

    private mapToCategory(data: any): IExpenseCategory {
        return {
            id: data.id,
            business_id: data.business_id,
            name: data.name,
            description: data.description,
            color: data.color,
            is_active: data.is_active,
            created_at: new Date(data.created_at),
            updated_at: new Date(data.updated_at)
        };
    }

    async getAll(businessId: number): Promise<IExpenseCategory[]> {
        const { data, error } = await this.supabase
            .from('expense_categories')
            .select('*')
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (error) throw error;
        return (data || []).map(this.mapToCategory);
    }

    async getById(businessId: number, id: number): Promise<IExpenseCategory | null> {
        const { data, error } = await this.supabase
            .from('expense_categories')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data ? this.mapToCategory(data) : null;
    }

    async create(businessId: number, category: Omit<IExpenseCategory, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<IExpenseCategory> {
        throw new Error("Creation of categories is disabled for businesses.");
    }

    async update(businessId: number, id: number, updates: Partial<IExpenseCategory>): Promise<IExpenseCategory | null> {
        throw new Error("Updating categories is disabled for businesses.");
    }

    async delete(businessId: number, id: number): Promise<boolean> {
        throw new Error("Deletion of categories is disabled for businesses.");
    }
}
