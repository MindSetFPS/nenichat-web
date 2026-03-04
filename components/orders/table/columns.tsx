"use client"

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dateToHuman from "@/Nenichat/Shared/app/date-to-human";
import { ColumnDef } from "@tanstack/react-table";
import { OrderWithContactName } from "@/Nenichat/Orders/app/dto/order-with-contact-name";
import { getPaymentStatusColor } from "@/lib//utils";
import { dateIntervalFilter } from "@/Nenichat/Orders/app/date-interval-funtion";

export const columns: ColumnDef<OrderWithContactName>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => (
            <Button
                className="w-min p-0"
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                ID
            </Button>
        ),
        cell: ({ row }) => {
            return (
                <Link
                    className="hover:underline w-1 text-blue-400 text-xs" 
                    href={`/orders/${row.original.id}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    #{row.original.id}
                </Link>
            );
        },
    },
    {
        accessorKey: "contact_id",
        header: "Contacto",
        cell: ({ row }) => {
            const items = row.original.items || [];
            const displayItems = items.slice(0, 3);
            const remaining = items.length - displayItems.length;

            return (
                <div className="flex flex-col gap-1">
                    <Link href={`/contacts/${row.original.contact_id}`}
                        className="hover:underline text-blue-400 w-min text-xs md:text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {row.original.contact_name || `#${row.original.contact_id}`}
                    </Link>
                    <div className="flex flex-col text-xs text-muted-foreground whitespace-nowrap">
                        {displayItems.map((item, index) => (
                            <span key={index}>
                                {item.quantity} x {item.product_name}
                            </span>
                        ))}
                        {remaining > 0 && (
                            <span>
                                + {remaining} más
                            </span>
                        )}
                    </div>
                </div>
            );
        }
    },
    {
        accessorKey: "total_amount",
        header: "Total",
        cell: ({ row }) => {
            return (
                <div className="text-right w-min text-xs">
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
                <div className="text-right w-min text-xs">
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
                <div className="text-right text-xs">
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
        filterFn: dateIntervalFilter,
        header: ({ column }) => (
            <Button
                className="w-min p-0 m-0 gap-0 ml-0 pl-0"
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Se creó
            </Button>
        ),
        cell: ({ row }) => {
            return (
                <div className="w-min text-right text-xs">
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
