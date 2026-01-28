import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { ExpenseRepository } from "@/Nenichat/Expenses/infra/persistance/ExpenseRepository";
import { ExpenseForm } from "@/components/forms/expense-form";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";

const expenseRepository = new ExpenseRepository(pool);

export const dynamic = 'force-dynamic';

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const expense = await expenseRepository.getById(parseInt(id));

    if (!expense) {
        notFound();
    }

    // Serialize for client component
    const plainExpense = JSON.parse(JSON.stringify(expense));

    return (
        <>
            <PageHeader title="Editar Gasto" />
            <ExpenseForm
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
