import { Pool } from 'pg';
import { IExpenseCategory } from '../../domain/IExpenseCategory';
import { IExpenseCategoryRepository } from '../../domain/IExpenseCategoryRepository';

/**
 * @class ExpenseCategoryRepository
 * @description PostgreSQL implementation of IExpenseCategoryRepository.
 */
export class ExpenseCategoryRepository implements IExpenseCategoryRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    private mapRowToCategory(row: any): IExpenseCategory {
        return {
            id: parseInt(row.id),
            business_id: row.business_id ? parseInt(row.business_id) : undefined,
            name: row.name,
            description: row.description,
            color: row.color,
            is_active: row.is_active,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        };
    }

    async getAll(businessId: number): Promise<IExpenseCategory[]> {
        const query = `
            SELECT * FROM expense_categories 
            WHERE is_active = true
            ORDER BY name ASC
        `;
        const result = await this.pool.query(query);
        return result.rows.map(row => this.mapRowToCategory(row));
    }

    async getById(businessId: number, id: number): Promise<IExpenseCategory | null> {
        const query = 'SELECT * FROM expense_categories WHERE id = $1';
        const result = await this.pool.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToCategory(result.rows[0]);
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
