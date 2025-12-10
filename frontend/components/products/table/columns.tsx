"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IProduct } from "@/Nenichat/Products/domain/IProduct";
import Link from "next/link";

export const columns: ColumnDef<IProduct>[] = [
    {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => (
            <Link className="text-left hover:underline text-blue-400" href={`/products/${row.original.id}`}>
                {row.original.name}
            </Link>
        ),
    },
    {
        accessorKey: "description",
        header: "Descripción",
    },
    { // render as currency
        accessorKey: "price",
        header: "Precio",
        cell: ({ row }) => (
            <div className="">
                ${row.original.price.toFixed(2)}
            </div>
        ),
    },
    {
        accessorKey: "stock",
        header: "Existencias",
    },
    {
        accessorKey: "id",
        header: "Id",
    },
];