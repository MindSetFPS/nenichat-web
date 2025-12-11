"use client"

import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IOrder } from "@/Nenichat/Orders/domain/IOrder";
import dateToHuman from "@/Nenichat/Shared/app/date-to-human";
import { ColumnDef } from "@tanstack/react-table";

const getPaymentStatusColor = (status: string) => {
    switch (status) {
        case 'paid': return 'bg-green-100 text-green-800 hover:bg-green-100';
        case 'partial': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
        case 'refunded': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
        default: return 'bg-red-100 text-red-800 hover:bg-red-100';
    }
};

// implement every attribute of IOrder
export const columns: ColumnDef<IOrder>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => (
            <Button
                className="w-min p-0"
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                ID
                {/* <ArrowUpDown className="ml-1 h-4 w-4 shrink opacity-50" /> */}
            </Button>
        ),
        cell: ({ row }) => {
            return (
                <Link className="hover:underline text-blue-400 w-min" href={`/orders/${row.original.id}`}>
                    #{row.original.id}
                </Link>
            );
        },
    },
    {
        accessorKey: "contact_id",
        header: "Contacto",
        cell: ({ row }) => {
            return (
                <Link href={`/chats/${row.original.contact_id}`} className="w-min">
                    {row.original.contact_id || `#${row.original.contact_id}`}
                </Link>
            );
        }
    },
    {
        accessorKey: "total_amount",
        header: "Total",
        cell: ({ row }) => {
            return (
                <div className="text-right w-min">
                    ${Number(row.original.total_amount).toFixed(2)}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Estado",
    },
    {
        accessorKey: "payment_method",
        header: "Método de pago",
    },
    {
        accessorKey: "amount_paid",
        header: "Pagado",
        cell: ({ row }) => {
            return (
                <div className="text-right w-min">
                    ${Number(row.original.amount_paid).toFixed(2)}
                </div>
            );
        },
    },
    {
        accessorKey: "refunded_amount",
        header: "Reembolsado",
        cell: ({ row }) => {
            return (
                <div className="text-right">
                    ${Number(row.original.refunded_amount).toFixed(2)}
                </div>
            );
        },
    },
    {
        accessorKey: "notes",
        header: "Notas",
    },
    {
        accessorKey: "payment_status",
        header: "Pago",
        cell: ({ row }) => {
            const paymentStatus = row.original.payment_status;
            return (
                <Badge className={getPaymentStatusColor(paymentStatus)} variant="outline">
                    {paymentStatus}
                </Badge>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <Button
                className="w-min p-0 m-0 gap-0 ml-0 pl-0"
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Se creó
                {/* <ArrowUpDown className="ml-1 h-4 w-4 shrink opacity-50" /> */}
            </Button>
        ),
        cell: ({ row }) => {
            return (
                <div className="w-min text-right">
                    {dateToHuman(String(row.original.created_at))}
                </div>
            );
        },
    },
    {
        accessorKey: "updated_at",
        header: "Ultima actualización",
        cell: ({ row }) => {
            return (
                <div className="text-right">
                    {dateToHuman(String(row.original.updated_at))}
                </div>
            );
        },
    },
];
