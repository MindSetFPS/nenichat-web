import { IProductWithUnitsSold } from '@/Nenichat/Products/domain/IProduct';
import { ProductRepository } from '@/Nenichat/Products/infra/persistance/ProductRepository';
import { ProductActions } from './ProductActions';
import { Metadata } from 'next/dist/lib/metadata/types/metadata-interface';
import ProductsList from '@/components/products/products-list';
import { pool } from '@/Nenichat/Shared/infra/persistance/db';
import { PageHeader } from '@/components/ui/page-header';
import Content from '@/components/layout/content';

const productRepository = new ProductRepository(pool);
export const metadata: Metadata = {
  title: 'Productos',
}
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
    <Content className="p-4 scroll-auto overflow-y-auto">
      <PageHeader title="Productos">
        {products.length !== 0 &&
          <ProductActions />
        }
      </PageHeader>
      <ProductsList />
    </Content>
  );
}
