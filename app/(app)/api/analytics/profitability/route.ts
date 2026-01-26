import { NextResponse } from 'next/server';
import { pool } from '@/Nenichat/Shared/infra/persistance/db';
import { ExpenseRepository } from '@/Nenichat/Expenses/infra/persistance/ExpenseRepository';
import { OrderRepository } from '@/Nenichat/Orders/infra/persistance/OrderRepository';
import { IProfitabilityReport } from '@/Nenichat/Expenses/app/dto/IProfitabilityReport';

const expenseRepository = new ExpenseRepository(pool);
const orderRepository = new OrderRepository(pool);

/**
 * GET /api/analytics/profitability
 * Calculate profitability metrics for a given date range
 * Query params: start_date, end_date (defaults to current month)
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Default to current month if no dates provided
        const now = new Date();
        const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const startDate = searchParams.get('start_date')
            ? new Date(searchParams.get('start_date')!)
            : defaultStartDate;
        const endDate = searchParams.get('end_date')
            ? new Date(searchParams.get('end_date')!)
            : defaultEndDate;

        // Fetch revenue data (only paid orders)
        const revenueQuery = `
            SELECT COALESCE(SUM(total_amount), 0) as total
            FROM orders
            WHERE payment_status = 'paid'
            AND created_at >= $1 AND created_at <= $2
        `;
        const revenueResult = await pool.query(revenueQuery, [startDate, endDate]);
        const revenue = parseFloat(revenueResult.rows[0].total);

        // Fetch daily revenue
        const dailyRevenueQuery = `
            SELECT 
                DATE(created_at) as date,
                SUM(total_amount) as amount
            FROM orders
            WHERE payment_status = 'paid'
            AND created_at >= $1 AND created_at <= $2
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;
        const dailyRevenueResult = await pool.query(dailyRevenueQuery, [startDate, endDate]);
        const revenueByDay = dailyRevenueResult.rows.map(row => ({
            date: new Date(row.date),
            amount: parseFloat(row.amount)
        }));

        // Fetch expense data
        const expenses = await expenseRepository.getTotalByDateRange(startDate, endDate);
        const expensesByCategory = await expenseRepository.getTotalByCategory(startDate, endDate);
        const expensesByDay = await expenseRepository.getDailyTotals(startDate, endDate);
        // Map to match interface
        const expensesByDayMapped = expensesByDay.map(item => ({
            date: item.date,
            amount: item.total
        }));

        // Calculate profitability metrics
        const profit = revenue - expenses;
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

        const report: IProfitabilityReport = {
            period: {
                startDate,
                endDate
            },
            revenue,
            expenses,
            profit,
            profitMargin,
            expensesByCategory: expensesByCategory.map(cat => ({
                category_id: cat.category_id,
                category_name: cat.category_name,
                category_color: cat.category_color,
                amount: cat.total,
                percentage: cat.percentage
            })),
            revenueByDay,
            expensesByDay: expensesByDayMapped
        };

        return NextResponse.json(report);
    } catch (error: any) {
        console.error('Error calculating profitability:', error);
        return NextResponse.json(
            { error: 'Failed to calculate profitability', details: error.message },
            { status: 500 }
        );
    }
}
