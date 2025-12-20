"use client"

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { IExpenseCategory } from "@/Nenichat/Expenses/domain/IExpenseCategory";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<IExpenseCategory>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button
                className="w-min p-0"
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Nombre
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: row.original.color }}
                    />
                    <span className="font-medium">{row.original.name}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "description",
        header: "Descripción",
        cell: ({ row }) => {
            return (
                <div className="max-w-[400px] text-muted-foreground">
                    {row.original.description || '-'}
                </div>
            );
        },
    },
    {
        accessorKey: "color",
        header: "Color",
        cell: ({ row }) => {
            return (
                <Badge
                    style={{ backgroundColor: row.original.color }}
                    className="text-white"
                >
                    {row.original.color}
                </Badge>
            );
        },
    },
    {
        accessorKey: "is_active",
        header: "Estado",
        cell: ({ row }) => {
            return (
                <Badge variant={row.original.is_active ? "default" : "secondary"}>
                    {row.original.is_active ? 'Activa' : 'Inactiva'}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
            return (
                <div className="flex gap-2">
                    <Link href={`/expense-categories/${row.original.id}/edit`}>
                        <Button variant="ghost" size="sm">
                            Editar
                        </Button>
                    </Link>
                </div>
            );
        },
    },
];
