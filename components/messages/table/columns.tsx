"use client"

import { getContactName } from "@/Nenichat/Contacts/app/get-contact-name"
import { IMessageWithSender } from "@/Nenichat/Messages/domain/IMessageWithSender"
import dateToHuman from "@/Nenichat/Shared/app/date-to-human"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

export const columns: ColumnDef<IMessageWithSender>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <span className="text-primary w-min">{row.original.id.slice(0, 5)}</span>,
    },
    {
        accessorKey: "sender",
        header: "Envíado por",
        cell: ({ row }) => <Link href={`/chats/${row.original.sender!.id}`}
            className="text-blue-400 w-min hover:underline">
            {getContactName(row.original.sender!)}
        </Link>,
    },
    {
        accessorKey: "content",
        header: "Mensaje",
        cell: ({ row }) => <div className="w-full text-wrap">
            {row.original.content}
        </div>,
    },
    {
        accessorKey: "created_at",
        header: "Envíado a las",
        cell: ({ row }) => <span className="text-primary w-min">
            {dateToHuman(row.original.created_at.toString())}
        </span>,
    },
]