import { SupabaseExpenseRepository } from "@/Nenichat/Expenses/infra/persistance/SupabaseExpenseRepository";
import { ExpenseForm } from "@/components/forms/expense-form";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBusinessFromUser } from "@/lib/user-auth";

export const dynamic = 'force-dynamic';

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return <div>Unauthorized</div>;
    }

    const expenseRepository = new SupabaseExpenseRepository(supabase);
    const expense = await expenseRepository.getById(business.id, parseInt(id));

    if (!expense) {
        notFound();
    }

    const categories = await expenseRepository.getAllCategories();

    const plainExpense = JSON.parse(JSON.stringify(expense));

    return (
        <>
            <PageHeader title="Editar Gasto" />
            <ExpenseForm
                categories={categories}
                businessId={business.id}
                initialData={{
                    id: plainExpense.id,
                    category_id: plainExpense.category_id,
                    amount: plainExpense.amount,
                    description: plainExpense.description,
                    vendor: plainExpense.vendor,
                    payment_method: plainExpense.payment_method,
                    notes: plainExpense.notes,
                    expense_date: new Date(plainExpense.expense_date).toISOString().split('T')[0]
                }}
            />
        </>
    );
}
