/**
 * @interface IExpense
 * @description Defines the structure for an expense.
 */
export interface IExpense {
    id: number;
    business_id: number;
    category_id: number;
    amount: number;
    description: string;
    vendor: string | null;
    payment_method: string | null;
    receipt_url: string | null;
    notes: string | null;
    expense_date: Date;
    created_at: Date;
    updated_at: Date;
}

/**
 * @interface IExpenseWithCategory
 * @description Extends IExpense with category information for display purposes.
 */
export interface IExpenseWithCategory extends IExpense {
    category_name: string;
    category_color: string;
}
