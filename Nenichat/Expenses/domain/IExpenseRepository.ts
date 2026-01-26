import { IExpense, IExpenseWithCategory } from './IExpense';

/**
 * @interface IExpenseRepository
 * @description Repository interface for expense operations.
 */
export interface IExpenseRepository {
    /**
     * Get all expenses
     */
    getAll(): Promise<IExpenseWithCategory[]>;

    /**
     * Get expense by ID
     */
    getById(id: number): Promise<IExpense | null>;

    /**
     * Get expenses by category ID
     */
    getByCategoryId(categoryId: number): Promise<IExpenseWithCategory[]>;

    /**
     * Get expenses within a date range
     */
    getByDateRange(startDate: Date, endDate: Date): Promise<IExpenseWithCategory[]>;

    /**
     * Create a new expense
     */
    create(expense: Omit<IExpense, 'id' | 'created_at' | 'updated_at'>): Promise<IExpense>;

    /**
     * Update an expense
     */
    update(id: number, updates: Partial<IExpense>): Promise<IExpense | null>;

    /**
     * Delete an expense
     */
    delete(id: number): Promise<boolean>;

    /**
     * Get total expenses within a date range
     */
    getTotalByDateRange(startDate: Date, endDate: Date): Promise<number>;

    /**
     * Get expenses grouped by category within a date range
     */
    getTotalByCategory(startDate: Date, endDate: Date): Promise<Array<{
        category_id: number;
        category_name: string;
        category_color: string;
        total: number;
        percentage: number;
    }>>;

    /**
     * Get daily expense totals within a date range
     */
    getDailyTotals(startDate: Date, endDate: Date): Promise<Array<{
        date: Date;
        total: number;
    }>>;
}
