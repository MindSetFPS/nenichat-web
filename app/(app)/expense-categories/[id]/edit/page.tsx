import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { ExpenseCategoryRepository } from "@/Nenichat/Expenses/infra/persistance/ExpenseCategoryRepository";
import { ExpenseCategoryForm } from "@/components/forms/expense-category-form";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";

const categoryRepository = new ExpenseCategoryRepository(pool);
export const dynamic = 'force-dynamic';

export default async function EditExpenseCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const category = await categoryRepository.getById(parseInt(id));

    if (!category) {
        notFound();
    }

    // Serialize for client component
    const plainCategory = JSON.parse(JSON.stringify(category));

    return (
        <>
            <PageHeader title="Editar Categoría" />
            <div className="overflow-scroll p-4">
                <ExpenseCategoryForm
                    initialData={{
                        id: plainCategory.id,
                        name: plainCategory.name,
                        description: plainCategory.description,
                        color: plainCategory.color,
                        is_active: plainCategory.is_active
                    }}
                />
            </div>
        </>
    );
}
