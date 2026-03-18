import { ExpenseFormClient } from "@/components/expense-form-client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseExpenseRepository } from "@/Nenichat/Expenses/infra/persistance/SupabaseExpenseRepository";

export const dynamic = 'force-dynamic';

async function getCategories() {
    const supabase = await createServerSupabaseClient();
    const expenseRepository = new SupabaseExpenseRepository(supabase);
    return expenseRepository.getAllCategories();
}

export default async function NewExpensePage() {
    const categories = await getCategories();

    return <ExpenseFormClient categories={categories} />;
}
