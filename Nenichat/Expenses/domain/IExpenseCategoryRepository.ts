import { IExpenseCategory } from './IExpenseCategory';

/**
 * @interface IExpenseCategoryRepository
 * @description Repository interface for expense category operations.
 */
export interface IExpenseCategoryRepository {
    /**
     * Get all active expense categories
     */
    getAll(): Promise<IExpenseCategory[]>;

    /**
     * Get expense category by ID
     */
    getById(id: number): Promise<IExpenseCategory | null>;

    /**
     * Create a new expense category
     */
    create(category: Omit<IExpenseCategory, 'id' | 'created_at' | 'updated_at'>): Promise<IExpenseCategory>;

    /**
     * Update an expense category
     */
    update(id: number, updates: Partial<IExpenseCategory>): Promise<IExpenseCategory | null>;

    /**
     * Soft delete an expense category (set is_active to false)
     */
    delete(id: number): Promise<boolean>;
}
