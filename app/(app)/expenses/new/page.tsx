import { ExpenseForm } from "@/components/forms/expense-form";

export const dynamic = 'force-dynamic';

export default async function NewExpensePage() {
    return (
        <>

            <h1 className="text-3xl font-bold tracking-tight">Nuevo Gasto</h1>

            <ExpenseForm />
        </>
    );
}
