import { ExpenseCategoryForm } from "@/components/forms/expense-category-form";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = 'force-dynamic';

export default async function NewExpenseCategoryPage() {
    return (
        <>
            <PageHeader content={<h1 className="text-3xl font-bold tracking-tight">Nueva Categoría de Gasto</h1>} />
            <div className="overflow-scroll p-4">
                <ExpenseCategoryForm />
            </div>
        </>
    );
}
