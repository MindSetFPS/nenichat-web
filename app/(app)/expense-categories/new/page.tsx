import { ExpenseCategoryForm } from "@/components/forms/expense-category-form";
import { HeaderAction } from "@/components/header-action";

export const dynamic = 'force-dynamic';

export default async function NewExpenseCategoryPage() {
    return (
        <>
            <HeaderAction>
                <h1 className="text-3xl font-bold tracking-tight">Nueva Categoría de Gasto</h1>
            </HeaderAction>
            <div className="overflow-scroll p-4">
                <ExpenseCategoryForm />
            </div>
        </>
    );
}
