'use client';

import { useEffect } from "react";
import { columns } from '@/components/products/table/columns';
import { DataTable } from "../data-table";
import { IProductWithUnitsSold } from '@/Nenichat/Products/domain/IProduct';
import { useProductStore } from "@/stores/product-store";

interface ProductsListProps {
    initialProducts: IProductWithUnitsSold[];
}

export default function ProductsList({ initialProducts }: ProductsListProps) {
    const products = useProductStore((state) => state.products);
    const setProducts = useProductStore((state) => state.setProducts);

    // Seed the store with the server-rendered products so the create/edit flows
    // share one source, without re-fetching what the page already loaded.
    useEffect(() => {
        if (products.length === 0) {
            setProducts(initialProducts);
        }
    }, [products.length, initialProducts, setProducts]);

    const list = products.length > 0 ? products : initialProducts;

    return (
        <DataTable
            columns={columns}
            data={list}
            searchInputColumnId={"name"}
            visibleColumns={{
                id: false,
                description: false,
            }}
        />
    );
}
