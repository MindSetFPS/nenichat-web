import { ExpenseForm } from "@/components/forms/expense-form";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = 'force-dynamic';

export default async function NewExpensePage() {
    return (
        <>
            <PageHeader content={<h1 className="text-3xl font-bold tracking-tight">Nuevo Gasto</h1>} />
            <div className="overflow-scroll p-4">
                <ExpenseForm />
            </div>
        </>
    );
}
