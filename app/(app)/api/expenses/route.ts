import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseExpenseRepository } from '@/Nenichat/Expenses/infra/persistance/SupabaseExpenseRepository';
import { getBusinessFromUser } from '@/lib/user-auth';

/**
 * GET /api/expenses
 * Fetch all expenses with optional filters
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
        const categoryId = searchParams.get('category_id');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        let expenses;

        if (startDate && endDate) {
            expenses = await expenseRepository.getByDateRange(
                business.id,
                new Date(startDate),
                new Date(endDate)
            );
        } else if (categoryId) {
            expenses = await expenseRepository.getByCategoryId(business.id, parseInt(categoryId));
        } else {
            expenses = await expenseRepository.getAll(business.id);
        }

        return NextResponse.json(expenses);
    } catch (error: any) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch expenses', details: error.message },
            { status: 500 }
        );
    }
}
