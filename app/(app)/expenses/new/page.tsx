import { ExpenseForm } from "@/components/forms/expense-form";
import { PageHeader } from "@/components/ui/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseExpenseRepository } from "@/Nenichat/Expenses/infra/persistance/SupabaseExpenseRepository";
import { getBusinessFromUser } from "@/lib/user-auth";

export const dynamic = 'force-dynamic';

export default async function NewExpensePage() {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return <div>Unauthorized</div>;
    }

    const expenseRepository = new SupabaseExpenseRepository(supabase);
    const categories = await expenseRepository.getAllCategories();

    return (
        <>
            <PageHeader title="Nuevo Gasto" />
            <ExpenseForm categories={categories} businessId={business.id} />
        </>
    );
}
