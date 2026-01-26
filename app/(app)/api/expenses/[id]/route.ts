import { NextResponse } from 'next/server';
import { pool } from '@/Nenichat/Shared/infra/persistance/db';
import { ExpenseRepository } from '@/Nenichat/Expenses/infra/persistance/ExpenseRepository';

const expenseRepository = new ExpenseRepository(pool);

/**
 * GET /api/expenses/[id]
 * Fetch a single expense by ID
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const expense = await expenseRepository.getById(parseInt(id));

        if (!expense) {
            return NextResponse.json(
                { error: 'Expense not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(expense);
    } catch (error: any) {
        console.error('Error fetching expense:', error);
        return NextResponse.json(
            { error: 'Failed to fetch expense', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/expenses/[id]
 * Update an expense
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updates: any = {};
        if (body.category_id !== undefined) updates.category_id = parseInt(body.category_id);
        if (body.amount !== undefined) updates.amount = parseFloat(body.amount);
        if (body.description !== undefined) updates.description = body.description;
        if (body.vendor !== undefined) updates.vendor = body.vendor;
        if (body.payment_method !== undefined) updates.payment_method = body.payment_method;
        if (body.receipt_url !== undefined) updates.receipt_url = body.receipt_url;
        if (body.notes !== undefined) updates.notes = body.notes;
        if (body.expense_date !== undefined) updates.expense_date = new Date(body.expense_date);

        const expense = await expenseRepository.update(parseInt(id), updates);

        if (!expense) {
            return NextResponse.json(
                { error: 'Expense not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(expense);
    } catch (error: any) {
        console.error('Error updating expense:', error);
        return NextResponse.json(
            { error: 'Failed to update expense', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/expenses/[id]
 * Delete an expense
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const success = await expenseRepository.delete(parseInt(id));

        if (!success) {
            return NextResponse.json(
                { error: 'Expense not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting expense:', error);
        return NextResponse.json(
            { error: 'Failed to delete expense', details: error.message },
            { status: 500 }
        );
    }
}
