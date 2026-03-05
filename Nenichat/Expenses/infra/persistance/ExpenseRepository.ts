import { Pool } from 'pg';
import { IExpense, IExpenseWithCategory } from '../../domain/IExpense';
import { IExpenseRepository } from '../../domain/IExpenseRepository';

/**
 * @class ExpenseRepository
 * @description PostgreSQL implementation of IExpenseRepository.
 */
export class ExpenseRepository implements IExpenseRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    private mapRowToExpense(row: any): IExpense {
        return {
            id: parseInt(row.id),
            business_id: parseInt(row.business_id),
            category_id: parseInt(row.category_id),
            amount: parseFloat(row.amount),
            description: row.description,
            vendor: row.vendor,
            payment_method: row.payment_method,
            receipt_url: row.receipt_url,
            notes: row.notes,
            expense_date: new Date(row.expense_date),
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        };
    }

    private mapRowToExpenseWithCategory(row: any): IExpenseWithCategory {
        return {
            ...this.mapRowToExpense(row),
            category_name: row.category_name,
            category_color: row.category_color
        };
    }

    async getAll(businessId: number): Promise<IExpenseWithCategory[]> {
        const query = `
            SELECT 
                e.*,
                ec.name as category_name,
                ec.color as category_color
            FROM expenses e
            JOIN expense_categories ec ON e.category_id = ec.id
            WHERE e.business_id = $1
            ORDER BY e.expense_date DESC, e.created_at DESC
        `;
        const result = await this.pool.query(query, [businessId]);
        return result.rows.map(row => this.mapRowToExpenseWithCategory(row));
    }

    async getById(businessId: number, id: number): Promise<IExpense | null> {
        const query = 'SELECT * FROM expenses WHERE id = $1 AND business_id = $2';
        const result = await this.pool.query(query, [id, businessId]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToExpense(result.rows[0]);
    }

    async getByCategoryId(businessId: number, categoryId: number): Promise<IExpenseWithCategory[]> {
        const query = `
            SELECT 
                e.*,
                ec.name as category_name,
                ec.color as category_color
            FROM expenses e
            JOIN expense_categories ec ON e.category_id = ec.id
            WHERE e.category_id = $1 AND e.business_id = $2
            ORDER BY e.expense_date DESC, e.created_at DESC
        `;
        const result = await this.pool.query(query, [categoryId, businessId]);
        return result.rows.map(row => this.mapRowToExpenseWithCategory(row));
    }

    async getByDateRange(businessId: number, startDate: Date, endDate: Date): Promise<IExpenseWithCategory[]> {
        const query = `
            SELECT 
                e.*,
                ec.name as category_name,
                ec.color as category_color
            FROM expenses e
            JOIN expense_categories ec ON e.category_id = ec.id
            WHERE e.expense_date >= $1 AND e.expense_date <= $2 AND e.business_id = $3
            ORDER BY e.expense_date DESC, e.created_at DESC
        `;
        const result = await this.pool.query(query, [startDate, endDate, businessId]);
        return result.rows.map(row => this.mapRowToExpenseWithCategory(row));
    }

    async create(businessId: number, expense: Omit<IExpense, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<IExpense> {
        const query = `
            INSERT INTO expenses (
                category_id, amount, description, vendor, 
                payment_method, receipt_url, notes, expense_date, business_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [
            expense.category_id,
            expense.amount,
            expense.description,
            expense.vendor,
            expense.payment_method,
            expense.receipt_url,
            expense.notes,
            expense.expense_date,
            businessId
        ];

        const result = await this.pool.query(query, values);
        return this.mapRowToExpense(result.rows[0]);
    }

    async update(businessId: number, id: number, updates: Partial<IExpense>): Promise<IExpense | null> {
        const fields = Object.keys(updates)
            .filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'business_id')
            .map((key, index) => `${key} = $${index + 3}`)
            .join(', ');

        const values = Object.entries(updates)
            .filter(([key]) => key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'business_id')
            .map(([, value]) => value);

        if (fields.length === 0) {
            return this.getById(businessId, id);
        }

        const query = `
            UPDATE expenses 
            SET ${fields}, updated_at = NOW() 
            WHERE id = $1 AND business_id = $2
            RETURNING *
        `;
        const result = await this.pool.query(query, [id, businessId, ...values]);

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToExpense(result.rows[0]);
    }

    async delete(businessId: number, id: number): Promise<boolean> {
        const query = 'DELETE FROM expenses WHERE id = $1 AND business_id = $2';
        const result = await this.pool.query(query, [id, businessId]);
        return (result.rowCount || 0) > 0;
    }

    async getTotalByDateRange(businessId: number, startDate: Date, endDate: Date): Promise<number> {
        const query = `
            SELECT COALESCE(SUM(amount), 0) as total
            FROM expenses
            WHERE expense_date >= $1 AND expense_date <= $2 AND business_id = $3
        `;
        const result = await this.pool.query(query, [startDate, endDate, businessId]);
        return parseFloat(result.rows[0].total);
    }

    async getTotalByCategory(businessId: number, startDate: Date, endDate: Date): Promise<Array<{
        category_id: number;
        category_name: string;
        category_color: string;
        total: number;
        percentage: number;
    }>> {
        const query = `
            WITH category_totals AS (
                SELECT 
                    e.category_id,
                    ec.name as category_name,
                    ec.color as category_color,
                    SUM(e.amount) as total
                FROM expenses e
                JOIN expense_categories ec ON e.category_id = ec.id
                WHERE e.expense_date >= $1 AND e.expense_date <= $2 AND e.business_id = $3
                GROUP BY e.category_id, ec.name, ec.color
            ),
            grand_total AS (
                SELECT SUM(total) as total FROM category_totals
            )
            SELECT 
                ct.category_id,
                ct.category_name,
                ct.category_color,
                ct.total,
                CASE 
                    WHEN gt.total > 0 THEN (ct.total / gt.total * 100)
                    ELSE 0
                END as percentage
            FROM category_totals ct
            CROSS JOIN grand_total gt
            ORDER BY ct.total DESC
        `;
        const result = await this.pool.query(query, [startDate, endDate, businessId]);
        return result.rows.map(row => ({
            category_id: parseInt(row.category_id),
            category_name: row.category_name,
            category_color: row.category_color,
            total: parseFloat(row.total),
            percentage: parseFloat(row.percentage)
        }));
    }

    async getDailyTotals(businessId: number, startDate: Date, endDate: Date): Promise<Array<{
        date: Date;
        total: number;
    }>> {
        const query = `
            SELECT 
                expense_date as date,
                SUM(amount) as total
            FROM expenses
            WHERE expense_date >= $1 AND expense_date <= $2 AND business_id = $3
            GROUP BY expense_date
            ORDER BY expense_date ASC
        `;
        const result = await this.pool.query(query, [startDate, endDate, businessId]);
        return result.rows.map(row => ({
            date: new Date(row.date),
            total: parseFloat(row.total)
        }));
    }

    private mapRowToCategory(row: any): any {
        return {
            id: row.id,
            business_id: row.business_id,
            name: row.name,
            description: row.description,
            color: row.color,
            is_active: row.is_active,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        };
    }

    async getAllCategories(): Promise<any[]> {
        const query = `
            SELECT * FROM expense_categories 
            WHERE is_active = true 
            ORDER BY name ASC
        `;
        const result = await this.pool.query(query);
        return result.rows.map(this.mapRowToCategory);
    }

    async getCategoryById(businessId: number, id: number): Promise<any | null> {
        const query = 'SELECT * FROM expense_categories WHERE id = $1 AND business_id = $2';
        const result = await this.pool.query(query, [id, businessId]);

        if (result.rows.length === 0) {
            return null;
        }
        return this.mapRowToCategory(result.rows[0]);
    }
}
