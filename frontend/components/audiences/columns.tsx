"use client"

import { ColumnDef } from "@tanstack/react-table";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { Checkbox } from "@/components/ui/checkbox";
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier";

export const columns: ColumnDef<IContact>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
    },
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "phone_number",
        header: "Telefono",
    },
    {
        id: "identifier",
        header: "Identifier",
        cell: ({ row }) => getContactIdentifier(row.original),
    }
];