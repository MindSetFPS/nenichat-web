"use client"

import { ExpenseForm } from "@/components/forms/expense-form";
import { PageHeader } from "@/components/ui/page-header";
import { useBusiness } from "@/components/providers/business-context";

interface ExpenseFormClientProps {
    categories: any[];
}

export function ExpenseFormClient({ categories }: ExpenseFormClientProps) {
    const business = useBusiness();

    return (
        <>
            <PageHeader title="Nuevo Gasto" />
            <ExpenseForm categories={categories} businessId={business!.id} />
        </>
    );
}
