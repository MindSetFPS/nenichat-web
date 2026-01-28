import { ExpenseForm } from "@/components/forms/expense-form";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = 'force-dynamic';

export default async function NewExpensePage() {
    return (
        <>
            <PageHeader title="Nuevo Gasto" />
            <ExpenseForm />
        </>
    );
}
