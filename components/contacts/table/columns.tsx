"use client"

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { IContact } from "@nenichat/domain/Contacts/domain/IContact";
import dateToHuman from "@nenichat/domain/Shared/app/date-to-human";
import { getContactName } from "@nenichat/domain/Contacts/app/get-contact-name";
import Link from "next/link";
import { dateIntervalFilter } from "@nenichat/domain/Orders/app/date-interval-funtion";

export const columns: ColumnDef<IContact & { last_message_time?: string }>[] = [
    {
        accessorKey: "phone_number",
        header: "Contacto",
        cell: ({ row }) => {
            return (
                <Link href={`/contacts/${row.original.id}`} className="w-min text-right text-blue-400 hover:underline text-wrap">
                    {getContactName(row.original)}
                </Link>
            );
        },
    },
    {
        accessorKey: "last_message_time",
        header: ({ column }) => (
            <Button
                className="w-min p-0 m-0 gap-0 ml-0 pl-0"
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Ultima interacción
            </Button>
        ),
        cell: ({ row }) => {
            return (
                <div className="w-min text-right">
                    {row.original.last_message_time && dateToHuman(String(row.original.last_message_time))}
                </div>
            );
        },
    },
    {
        accessorKey: "created_at",
        filterFn: dateIntervalFilter,
        header: "Creado",
        cell: ({ row }) => {
            return (
                <div className="w-min text-right">
                    {dateToHuman(String(row.original.created_at))}
                </div>
            );
        },
    }
];