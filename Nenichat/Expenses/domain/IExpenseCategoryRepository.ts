import { IExpenseCategory } from './IExpenseCategory';

/**
 * @interface IExpenseCategoryRepository
 * @description Repository interface for expense category operations.
 */
export interface IExpenseCategoryRepository {
    /**
     * Get all active expense categories
     */
    getAll(businessId: number): Promise<IExpenseCategory[]>;

    /**
     * Get expense category by ID
     */
    getById(businessId: number, id: number): Promise<IExpenseCategory | null>;

    /**
     * Create a new expense category
     */
    create(businessId: number, category: Omit<IExpenseCategory, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<IExpenseCategory>;

    /**
     * Update an expense category
     */
    update(businessId: number, id: number, updates: Partial<IExpenseCategory>): Promise<IExpenseCategory | null>;

    /**
     * Soft delete an expense category (set is_active to false)
     */
    delete(businessId: number, id: number): Promise<boolean>;
}
