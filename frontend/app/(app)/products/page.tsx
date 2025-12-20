import { Package } from 'lucide-react';
import { pool } from '@/Nenichat/Shared/infra/persistance/db';
import { IProductWithUnitsSold } from '@/Nenichat/Products/domain/IProduct';
import { ProductRepository } from '@/Nenichat/Products/infra/persistance/ProductRepository';
import { ProductActions } from './ProductActions';
import { EmptyList } from '@/components/empty-list';
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/products/table/columns';
import { HeaderAction } from '@/components/header-action';


const productRepository = new ProductRepository(pool);
export const dynamic = 'force-dynamic';

/**
 * @function ProductsPage
 * @description A server component page to display a list of products.
 *              Fetches product data directly from the ProductRepository.
 */
export default async function ProductsPage() {
  let products: IProductWithUnitsSold[] = [];
  let error: string | null = null;

  try {
    products = await productRepository.getAll();


    // get montly sales
    const query = `
    SELECT
    COUNT(*) as units_sold
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.product_id = $1
    AND o.created_at >= CURRENT_DATE - INTERVAL '1 month'
    `;

    // loop every product
    for (const product of products) {
      const result = await pool.query(query, [product.id]);
      product.units_sold = result.rows[0].units_sold;
    }

    // sort by is_active true first, is_active false second
    products.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));
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
      <HeaderAction>
        <h1 className="text-2xl font-bold">
          Products
        </h1>
        {products.length !== 0 &&
          <ProductActions />
        }
      </HeaderAction>

      {products.length === 0 ?
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
    </>
  );
}
