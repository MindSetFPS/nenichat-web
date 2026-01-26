import { Package } from "lucide-react";
import { IProductWithUnitsSold } from "@/Nenichat/Products/domain/IProduct";
import { columns } from '@/components/products/table/columns';
import { ProductActions } from "@/app/(app)/products/ProductActions";
import { EmptyList } from "../empty-list";
import { DataTable } from "../data-table";

export default function ProductsList({ products }: { products: IProductWithUnitsSold[] }) {
    return (
        <div>
            {products && products.length === 0 ?
                <EmptyList
                    title="No Products"
                    description="Start building your product catalog by creating your first product."
                    action={<ProductActions />}
                    icon={<Package className="w-16 h-16 text-primary" strokeWidth={1.5} />}
                />
                :
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