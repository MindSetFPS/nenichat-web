import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseExpenseCategoryRepository } from '@/Nenichat/Expenses/infra/persistance/SupabaseExpenseCategoryRepository';
import { getBusinessFromUser } from '@/lib/user-auth';

/**
 * GET /api/expense-categories
 * Fetch all active expense categories
 */
export async function GET() {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const categoryRepository = new SupabaseExpenseCategoryRepository(supabase);

    try {
        const categories = await categoryRepository.getAll(business.id);
        return NextResponse.json(categories);
    } catch (error: any) {
        console.error('Error fetching expense categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch expense categories', details: error.message },
            { status: 500 }
        );
    }
}


