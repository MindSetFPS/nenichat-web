import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseExpenseCategoryRepository } from '@/Nenichat/Expenses/infra/persistance/SupabaseExpenseCategoryRepository';
import { getBusinessFromUser } from '@/lib/user-auth';

/**
 * GET /api/expense-categories/[id]
 * Fetch a single expense category by ID
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const categoryRepository = new SupabaseExpenseCategoryRepository(supabase);

    try {
        const { id } = await params;
        const category = await categoryRepository.getById(business.id, parseInt(id));

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


