import { Package } from 'lucide-react';
import { pool } from '@/Nenichat/Shared/infra/persistance/db';
import { IProduct } from '@/Nenichat/Products/domain/IProduct';
import { ProductRepository } from '@/Nenichat/Products/infra/persistance/ProductRepository';
import { ProductActions } from './ProductActions';
import { EmptyList } from '@/components/empty-list';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/products/table/columns';

const productRepository = new ProductRepository(pool);
export const dynamic = 'force-dynamic';

/**
 * @function ProductsPage
 * @description A server component page to display a list of products.
 *              Fetches product data directly from the ProductRepository.
 */
export default async function ProductsPage() {
  let products: IProduct[] = [];
  let error: string | null = null;

  try {
    products = await productRepository.getAll();
    products = JSON.parse(JSON.stringify(products));
  } catch (err: any) {
    console.error('Error fetching products in server component:', err);
    error = 'Failed to load products.';
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <PageHeader content={
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Products
          </h1>
          {products.length !== 0 &&
            <ProductActions />
          }
        </div>
      } />

      {products.length === 0 ?
        <EmptyList
          title="No Products"
          description="Start building your product catalog by creating your first product."
          action={<ProductActions />}
          icon={<Package className="w-16 h-16 text-primary" strokeWidth={1.5} />}
        />
        :
        <div className="container mx-auto p-4">
          <DataTable
            columns={columns}
            data={products}
            visibleColumns={{
              id: false,
              description: false,
            }}
          />
        </div>
      }
    </>
  );
}
