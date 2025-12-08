"use client"

import { Badge } from "@/components/ui/badge";
import { IOrder } from "@/Nenichat/Orders/domain/IOrder";
import dateToHuman from "@/Nenichat/Shared/app/date-to-human";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

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
        header: "ID",
        cell: ({ row }) => {
            return (
                <Link className="hover:underline text-blue-400" href={`/orders/${row.original.id}`}>
                    #{row.original.id}
                </Link>
            );
        },
    },
    {
        accessorKey: "contact_id",
        header: "Contacto",
    },
    {
        accessorKey: "total_amount",
        header: "Total",
        cell: ({ row }) => {
            return (
                <div className="text-right">
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
                <div className="text-right">
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
        header: "Fecha de creación",
        cell: ({ row }) => {
            return (
                <div className="text-right">
                    {dateToHuman(String(row.original.created_at))}
                </div>
            );
        },
    },
    {
        accessorKey: "updated_at",
        header: "Fecha de actualización",
        cell: ({ row }) => {
            return (
                <div className="text-right">
                    {dateToHuman(String(row.original.updated_at))}
                </div>
            );
        },
    },
];
