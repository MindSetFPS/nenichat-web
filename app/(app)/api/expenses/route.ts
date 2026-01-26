import { NextResponse } from 'next/server';
import { pool } from '@/Nenichat/Shared/infra/persistance/db';
import { ExpenseRepository } from '@/Nenichat/Expenses/infra/persistance/ExpenseRepository';

const expenseRepository = new ExpenseRepository(pool);

/**
 * GET /api/expenses
 * Fetch all expenses with optional filters
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('category_id');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        let expenses;

        if (startDate && endDate) {
            expenses = await expenseRepository.getByDateRange(
                new Date(startDate),
                new Date(endDate)
            );
        } else if (categoryId) {
            expenses = await expenseRepository.getByCategoryId(parseInt(categoryId));
        } else {
            expenses = await expenseRepository.getAll();
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
