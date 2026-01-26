import { ExpenseForm } from "@/components/forms/expense-form";
import { HeaderAction } from "@/components/header-action";

export const dynamic = 'force-dynamic';

export default async function NewExpensePage() {
    return (
        <>
            <HeaderAction>
                <h1 className="text-3xl font-bold tracking-tight">Nuevo Gasto</h1>
            </HeaderAction>
            <ExpenseForm />
        </>
    );
}
