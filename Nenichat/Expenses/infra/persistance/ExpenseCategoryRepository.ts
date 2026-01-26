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
            name: row.name,
            description: row.description,
            color: row.color,
            is_active: row.is_active,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        };
    }

    async getAll(): Promise<IExpenseCategory[]> {
        const query = `
            SELECT * FROM expense_categories 
            WHERE is_active = true 
            ORDER BY name ASC
        `;
        const result = await this.pool.query(query);
        return result.rows.map(row => this.mapRowToCategory(row));
    }

    async getById(id: number): Promise<IExpenseCategory | null> {
        const query = 'SELECT * FROM expense_categories WHERE id = $1';
        const result = await this.pool.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToCategory(result.rows[0]);
    }

    async create(category: Omit<IExpenseCategory, 'id' | 'created_at' | 'updated_at'>): Promise<IExpenseCategory> {
        const query = `
            INSERT INTO expense_categories (name, description, color, is_active)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [
            category.name,
            category.description,
            category.color,
            category.is_active
        ];

        const result = await this.pool.query(query, values);
        return this.mapRowToCategory(result.rows[0]);
    }

    async update(id: number, updates: Partial<IExpenseCategory>): Promise<IExpenseCategory | null> {
        const fields = Object.keys(updates)
            .filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
            .map((key, index) => `${key} = $${index + 2}`)
            .join(', ');

        const values = Object.entries(updates)
            .filter(([key]) => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
            .map(([, value]) => value);

        if (fields.length === 0) {
            return this.getById(id);
        }

        const query = `
            UPDATE expense_categories 
            SET ${fields}, updated_at = NOW() 
            WHERE id = $1 
            RETURNING *
        `;
        const result = await this.pool.query(query, [id, ...values]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToCategory(result.rows[0]);
    }

    async delete(id: number): Promise<boolean> {
        // Soft delete by setting is_active to false
        const query = `
            UPDATE expense_categories 
            SET is_active = false, updated_at = NOW() 
            WHERE id = $1
        `;
        const result = await this.pool.query(query, [id]);
        return (result.rowCount || 0) > 0;
    }
}
