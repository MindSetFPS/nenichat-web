import { ExpenseCategoryForm } from "@/components/forms/expense-category-form";

export const dynamic = 'force-dynamic';

export default async function NewExpenseCategoryPage() {
    return (
        <>

            <h1 className="text-3xl font-bold tracking-tight">Nueva Categoría de Gasto</h1>

            <div className="overflow-scroll p-4">
                <ExpenseCategoryForm />
            </div>
        </>
    );
}
