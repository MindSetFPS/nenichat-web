import { NextResponse } from 'next/server';
import { pool } from '@/Nenichat/Shared/infra/persistance/db';
import { ExpenseCategoryRepository } from '@/Nenichat/Expenses/infra/persistance/ExpenseCategoryRepository';

const categoryRepository = new ExpenseCategoryRepository(pool);

/**
 * GET /api/expense-categories/[id]
 * Fetch a single expense category by ID
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const category = await categoryRepository.getById(parseInt(id));

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error: any) {
        console.error('Error fetching category:', error);
        return NextResponse.json(
            { error: 'Failed to fetch category', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/expense-categories/[id]
 * Update an expense category
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updates: any = {};
        if (body.name !== undefined) updates.name = body.name;
        if (body.description !== undefined) updates.description = body.description;
        if (body.color !== undefined) updates.color = body.color;
        if (body.is_active !== undefined) updates.is_active = body.is_active;

        const category = await categoryRepository.update(parseInt(id), updates);

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error: any) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Failed to update category', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/expense-categories/[id]
 * Soft delete an expense category
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const success = await categoryRepository.delete(parseInt(id));

        if (!success) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category', details: error.message },
            { status: 500 }
        );
    }
}
