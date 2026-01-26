import { NextResponse } from 'next/server';
import { pool } from '@/Nenichat/Shared/infra/persistance/db';
import { ExpenseRepository } from '@/Nenichat/Expenses/infra/persistance/ExpenseRepository';

const expenseRepository = new ExpenseRepository(pool);

/**
 * POST /api/expenses/create
 * Create a new expense
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.category_id || !body.amount || !body.description) {
            return NextResponse.json(
                { error: 'Missing required fields: category_id, amount, description' },
                { status: 400 }
            );
        }

        const expense = await expenseRepository.create({
            category_id: parseInt(body.category_id),
            amount: parseFloat(body.amount),
            description: body.description,
            vendor: body.vendor || null,
            payment_method: body.payment_method || null,
            receipt_url: body.receipt_url || null,
            notes: body.notes || null,
            expense_date: body.expense_date ? new Date(body.expense_date) : new Date()
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
