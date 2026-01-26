"use client"

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dateToHuman from "@/Nenichat/Shared/app/date-to-human";
import { ColumnDef } from "@tanstack/react-table";
import { IExpenseWithCategory } from "@/Nenichat/Expenses/domain/IExpense";
import { ArrowUpDown, Trash2 } from "lucide-react";

export const columns: ColumnDef<IExpenseWithCategory>[] = [
    {
        accessorKey: "expense_date",
        header: ({ column }) => (
            <Button
                className="w-min p-0"
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Fecha
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const date = new Date(row.original.expense_date);
            return (
                <div className="w-min">
                    {date.toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </div>
            );
        },
    },
    {
        accessorKey: "category_name",
        header: "Categoría",
        cell: ({ row }) => {
            return (
                <Badge
                    style={{ backgroundColor: row.original.category_color }}
                    className="text-white"
                >
                    {row.original.category_name}
                </Badge>
            );
        },
    },
    {
        accessorKey: "description",
        header: "Descripción",
        cell: ({ row }) => {
            return (
                <div className="max-w-[300px] truncate">
                    {row.original.description}
                </div>
            );
        },
    },
    {
        accessorKey: "vendor",
        header: "Proveedor",
        cell: ({ row }) => {
            return (
                <div className="text-muted-foreground">
                    {row.original.vendor || '-'}
                </div>
            );
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <Button
                className="w-min p-0"
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Monto
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            return (
                <div className="text-right font-medium">
                    ${Number(row.original.amount).toFixed(2)}
                </div>
            );
        },
    },
    {
        accessorKey: "payment_method",
        header: "Método de pago",
        cell: ({ row }) => {
            const method = row.original.payment_method;
            return (
                <div className="capitalize">
                    {method || '-'}
                </div>
            );
        },
    },
    {
        accessorKey: "notes",
        header: "Notas",
        cell: ({ row }) => {
            return (
                <div className="max-w-[200px] truncate text-muted-foreground text-sm">
                    {row.original.notes || '-'}
                </div>
            );
        },
    },
    {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
            return (
                <div className="flex gap-2">
                    <Link href={`/expenses/${row.original.id}/edit`}>
                        <Button variant="ghost" size="sm">
                            Editar
                        </Button>
                    </Link>
                </div>
            );
        },
    },
];
