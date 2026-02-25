'use client';

import { useEffect } from "react";
import { columns } from '@/components/products/table/columns';
import { DataTable } from "../data-table";
import { useProductStore } from "@/stores/product-store";

export default function ProductsList() {
    const { products, fetchProducts } = useProductStore();

    useEffect(() => {
        const loadProducts = async () => {
            if (products.length === 0) {
                await fetchProducts();
            }
        };
        loadProducts();
    }, [products.length, fetchProducts])

    return (
        <div>
            {products && products.length > 0 &&
                <DataTable
                    columns={columns}
                    data={products}
                    searchInputColumnId={"name"}
                    visibleColumns={{
                        id: false,
                        description: false,
                    }}
                />
            }
        </div>
    )
}