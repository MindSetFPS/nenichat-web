import { SupabaseExpenseRepository } from "@/Nenichat/Expenses/infra/persistance/SupabaseExpenseRepository";
import { Receipt } from "lucide-react";
import { EmptyList } from "@/components/empty-list";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/expenses/table/columns";
import { PageHeader } from "@/components/ui/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBusinessFromUser } from "@/lib/user-auth";
import CreateExpenseButton from "@/components/expenses/create-expense-button";

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return <div>Unauthorized</div>;
    }

    const expenseRepository = new SupabaseExpenseRepository(supabase);
    const expenses = await expenseRepository.getAll(business.id);

    console.log(expenses)
    const plainExpenses = JSON.parse(JSON.stringify(expenses));

    if (plainExpenses.length === 0) {
        return (
            <>
                <PageHeader />
                <EmptyList
                    title="No hay gastos"
                    description="Comienza a registrar tus gastos para monitorear la rentabilidad de tu negocio."
                    action={<CreateExpenseButton />}
                    icon={<Receipt className="w-16 h-16 text-primary" strokeWidth={1.5} />}
                />
            </>
        )
    }

    return (
        <>
            <PageHeader title="Gastos">
                <CreateExpenseButton />
            </PageHeader>

            <div className="overflow-y-auto h-full">
                <DataTable
                    columns={columns}
                    searchInputColumnId="description"
                    visibleColumns={{
                        "notes": false,
                    }}
                    data={plainExpenses}
                />
            </div>
        </>
    );
}
