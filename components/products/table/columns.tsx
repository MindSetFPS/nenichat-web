"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IProductWithUnitsSold } from "@/Nenichat/Products/domain/IProduct";
import Link from "next/link";
import { AvailableCheckbot } from "./available-checkbot";

export const columns: ColumnDef<IProductWithUnitsSold>[] = [
    {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => (
            <Link
                className="text-left w-auto wrap-words text-wrap hover:underline text-blue-400"
                href={`/products/${row.original.id}`}>
                {row.original.name}
            </Link>
        ),
    },
    {
        accessorKey: "units_sold",
        header: "Ventas",
        cell: ({ row }) => (
            <div className="w-min">
                {row.original.units_sold}
            </div>
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
            <div className="w-min">
                ${row.original.price.toFixed(2)}
            </div>
        ),
    },
    {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => (
            <div className="w-min">
                {row.original.stock}
            </div>
        ),
    },
    {
        accessorKey: "is_active",
        header: "Activo",
        cell: ({ row }) => (
            <div className="w-min">
                <AvailableCheckbot product={row.original} />
            </div>
        ),
    },
    {
        accessorKey: "id",
        header: "Id",
    },
];