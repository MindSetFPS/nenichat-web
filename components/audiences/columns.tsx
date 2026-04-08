"use client"

import { ColumnDef } from "@tanstack/react-table";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { Checkbox } from "@/components/ui/checkbox";

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
        filterFn: "includesString",
    },
    {
        accessorKey: "lid",
        header: "Lid",
        filterFn: "includesString",
    },
    {
        accessorKey: "phone_number",
        header: "Telefono",
        filterFn: "includesString",
    },
    {
        accessorKey: "contact_name",
        header: "Nombre",
        filterFn: "includesString",
    },
    {
        accessorKey: "pushname",
        header: "Pushname",
        filterFn: "includesString",
    },
    {
        accessorKey: "username",
        header: "Username",
        filterFn: "includesString",
    }
];