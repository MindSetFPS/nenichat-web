import Image from 'next/image';
import Link from 'next/link';
import { pool } from '../../Nenichat/Shared/infra/persistance/db';
import { IProduct } from '../../Nenichat/Products/domain/IProduct';
import { ProductRepository } from '../../Nenichat/Products/infra/persistance/ProductRepository';
import { getProductImageUrl } from '../../lib/utils';
import { ProductActions } from './ProductActions';
import { EmptyList } from '@/components/empty-list';
import { Package } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

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
  } catch (err: any) {
    console.error('Error fetching products in server component:', err);
    error = 'Failed to load products.';
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <PageHeader content={<h1 className="text-2xl font-bold">Products</h1>} />
      {products.length === 0 ?
        <EmptyList
          title="No Products"
          description="Start building your product catalog by creating your first product."
          action={<ProductActions />}
          icon={<Package className="w-16 h-16 text-primary" strokeWidth={1.5} />}
        />
        :
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <ProductActions />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg shadow-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={getProductImageUrl(product.images[0].path)}
                      alt={product.images[0].alt_text || product.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded-t-lg">
                    No Image
                  </div>
                )}
                <div className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                  </Link>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description || 'No description available.'}
                  </p>
                  <div className="text-2xl font-bold ">${product.price.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">Stock: {product.stock}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    </>
  );
}
