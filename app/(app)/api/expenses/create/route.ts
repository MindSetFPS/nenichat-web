import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseExpenseRepository } from '@/Nenichat/Expenses/infra/persistance/SupabaseExpenseRepository';
import { getBusinessFromUser } from '@/lib/user-auth';

/**
 * POST /api/expenses/create
 * Create a new expense
 */
export async function POST(request: Request) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const expenseRepository = new SupabaseExpenseRepository(supabase);

    try {
        const body = await request.json();

        if (!body.category_id || !body.amount || !body.description) {
            return NextResponse.json(
                { error: 'Missing required fields: category_id, amount, description' },
                { status: 400 }
            );
        }

        const expense = await expenseRepository.create(business.id, {
            category_id: parseInt(body.category_id),
            amount: parseFloat(body.amount),
            description: body.description,
            vendor: body.vendor || null,
            payment_method: body.payment_method || null,
            receipt_url: body.receipt_url || null,
            notes: body.notes || null,
            expense_date: body.expense_date || new Date().toISOString().split('T')[0]
        });

        return NextResponse.json(expense, { status: 201 });
    } catch (error: any) {
        console.error('Error creating expense:', error);
        return NextResponse.json(
            { error: 'Failed to create expense', details: error.message },
            { status: 500 }
        );
    }
}
