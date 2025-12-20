/**
 * @interface IProfitabilityReport
 * @description DTO for profitability analysis combining revenue and expenses.
 */
export interface IProfitabilityReport {
    period: {
        startDate: Date;
        endDate: Date;
    };
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number; // percentage
    expensesByCategory: Array<{
        category_id: number;
        category_name: string;
        category_color: string;
        amount: number;
        percentage: number;
    }>;
    revenueByDay: Array<{
        date: Date;
        amount: number;
    }>;
    expensesByDay: Array<{
        date: Date;
        amount: number;
    }>;
}
