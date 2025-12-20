import { NextResponse } from 'next/server';
import { pool } from '@/Nenichat/Shared/infra/persistance/db';
import { ExpenseCategoryRepository } from '@/Nenichat/Expenses/infra/persistance/ExpenseCategoryRepository';

const categoryRepository = new ExpenseCategoryRepository(pool);

/**
 * GET /api/expense-categories
 * Fetch all active expense categories
 */
export async function GET() {
    try {
        const categories = await categoryRepository.getAll();
        return NextResponse.json(categories);
    } catch (error: any) {
        console.error('Error fetching expense categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch expense categories', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/expense-categories
 * Create a new expense category
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.name) {
            return NextResponse.json(
                { error: 'Missing required field: name' },
                { status: 400 }
            );
        }

        const category = await categoryRepository.create({
            name: body.name,
            description: body.description || null,
            color: body.color || '#6B7280',
            is_active: true
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        console.error('Error creating expense category:', error);
        return NextResponse.json(
            { error: 'Failed to create expense category', details: error.message },
            { status: 500 }
        );
    }
}
