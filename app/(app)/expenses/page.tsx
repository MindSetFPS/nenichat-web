import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { ExpenseRepository } from "@/Nenichat/Expenses/infra/persistance/ExpenseRepository";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Receipt } from "lucide-react";
import { EmptyList } from "@/components/empty-list";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/expenses/table/columns";

const expenseRepository = new ExpenseRepository(pool);

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
    const expenses = await expenseRepository.getAll();
    const plainExpenses = JSON.parse(JSON.stringify(expenses));

    function CreateExpenseButton() {
        return (
            <Link href="/expenses/new">
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Gasto
                </Button>
            </Link>
        )
    }

    return (
        <>

            <h1 className="text-2xl font-bold">Gastos</h1>
            {
                plainExpenses.length !== 0 ?
                    <CreateExpenseButton />
                    :
                    null
            }


            <div className="overflow-y-auto h-full">
                {
                    plainExpenses.length === 0 ?
                        <EmptyList
                            title="No hay gastos"
                            description="Comienza a registrar tus gastos para monitorear la rentabilidad de tu negocio."
                            action={<CreateExpenseButton />}
                            icon={<Receipt className="w-16 h-16 text-primary" strokeWidth={1.5} />}
                        />
                        :
                        <DataTable
                            columns={columns}
                            searchInputColumnId="description"
                            visibleColumns={{
                                "notes": false,
                            }}
                            data={plainExpenses}
                        />
                }
            </div>
        </>
    );
}
