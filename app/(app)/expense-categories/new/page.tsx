import { ExpenseCategoryForm } from "@/components/forms/expense-category-form";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = 'force-dynamic';

export default async function NewExpenseCategoryPage() {
    return (
        <>
            <PageHeader title="Nueva Categoría de Gasto" />
            <div className="overflow-scroll p-4">
                <ExpenseCategoryForm />
            </div>
        </>
    );
}
