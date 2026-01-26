import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { ExpenseCategoryRepository } from "@/Nenichat/Expenses/infra/persistance/ExpenseCategoryRepository";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Tag } from "lucide-react";
import { EmptyList } from "@/components/empty-list";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/expense-categories/table/columns";
import { HeaderAction } from "@/components/header-action";

const categoryRepository = new ExpenseCategoryRepository(pool);

export const dynamic = 'force-dynamic';

export default async function ExpenseCategoriesPage() {
    const categories = await categoryRepository.getAll();
    const plainCategories = JSON.parse(JSON.stringify(categories));

    function CreateCategoryButton() {
        return (
            <Link href="/expense-categories/new">
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Categoría
                </Button>
            </Link>
        )
    }

    return (
        <>
            <HeaderAction>
                <h1 className="text-2xl font-bold">Categorías de Gastos</h1>
                {
                    plainCategories.length !== 0 ?
                        <CreateCategoryButton />
                        :
                        null
                }
            </HeaderAction>

            <div className="overflow-y-auto h-full">
                {
                    plainCategories.length === 0 ?
                        <EmptyList
                            title="No hay categorías"
                            description="Crea categorías para organizar tus gastos."
                            action={<CreateCategoryButton />}
                            icon={<Tag className="w-16 h-16 text-primary" strokeWidth={1.5} />}
                        />
                        :
                        <DataTable
                            columns={columns}
                            searchInputColumnId="name"
                            visibleColumns={{
                                "description": false,
                            }}
                            data={plainCategories}
                        />
                }
            </div>
        </>
    );
}
