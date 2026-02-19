import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseExpenseRepository } from '@/Nenichat/Expenses/infra/persistance/SupabaseExpenseRepository';
import { getBusinessFromUser } from '@/lib/user-auth';
import { IProfitabilityReport } from '@/Nenichat/Expenses/app/dto/IProfitabilityReport';

/**
 * GET /api/analytics/profitability
 * Calculate profitability metrics for a given date range
 * Query params: start_date, end_date (defaults to current month)
 */
export async function GET(request: Request) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const expenseRepository = new SupabaseExpenseRepository(supabase);

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

        // Fetch revenue data (only paid orders) using Supabase
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('total_amount, created_at')
            .eq('business_id', business.id)
            .eq('payment_status', 'paid')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

        if (ordersError) throw ordersError;

        const revenue = (orders || []).reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

        // Fetch daily revenue
        const dailyRevenue: Record<string, number> = {};
        (orders || []).forEach(order => {
            const dateStr = new Date(order.created_at).toISOString().split('T')[0];
            dailyRevenue[dateStr] = (dailyRevenue[dateStr] || 0) + parseFloat(order.total_amount);
        });

        const revenueByDay = Object.entries(dailyRevenue).map(([date, amount]) => ({
            date: new Date(date),
            amount
        })).sort((a, b) => a.date.getTime() - b.date.getTime());

        // Fetch expense data
        const expenses = await expenseRepository.getTotalByDateRange(business.id, startDate, endDate);
        const expensesByCategory = await expenseRepository.getTotalByCategory(business.id, startDate, endDate);
        const expensesByDay = await expenseRepository.getDailyTotals(business.id, startDate, endDate);

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
