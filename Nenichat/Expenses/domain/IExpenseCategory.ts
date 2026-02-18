/**
 * @interface IExpenseCategory
 * @description Defines the structure for an expense category.
 */
export interface IExpenseCategory {
    id: number;
    business_id?: number;
    name: string;
    description: string | null;
    color: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
