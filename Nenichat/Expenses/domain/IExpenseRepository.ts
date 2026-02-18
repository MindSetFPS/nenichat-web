import { IExpense, IExpenseWithCategory } from './IExpense';

/**
 * @interface IExpenseRepository
 * @description Repository interface for expense operations.
 */
export interface IExpenseRepository {
    /**
     * Get all expenses
     */
    getAll(businessId: number): Promise<IExpenseWithCategory[]>;

    /**
     * Get expense by ID
     */
    getById(businessId: number, id: number): Promise<IExpense | null>;

    /**
     * Get expenses by category ID
     */
    getByCategoryId(businessId: number, categoryId: number): Promise<IExpenseWithCategory[]>;

    /**
     * Get expenses within a date range
     */
    getByDateRange(businessId: number, startDate: Date, endDate: Date): Promise<IExpenseWithCategory[]>;

    /**
     * Create a new expense
     */
    create(businessId: number, expense: Omit<IExpense, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<IExpense>;

    /**
     * Update an expense
     */
    update(businessId: number, id: number, updates: Partial<IExpense>): Promise<IExpense | null>;

    /**
     * Delete an expense
     */
    delete(businessId: number, id: number): Promise<boolean>;

    /**
     * Get total expenses within a date range
     */
    getTotalByDateRange(businessId: number, startDate: Date, endDate: Date): Promise<number>;

    /**
     * Get expenses grouped by category within a date range
     */
    getTotalByCategory(businessId: number, startDate: Date, endDate: Date): Promise<Array<{
        category_id: number;
        category_name: string;
        category_color: string;
        total: number;
        percentage: number;
    }>>;

    /**
     * Get daily expense totals within a date range
     */
    getDailyTotals(businessId: number, startDate: Date, endDate: Date): Promise<Array<{
        date: Date;
        total: number;
    }>>;
}
