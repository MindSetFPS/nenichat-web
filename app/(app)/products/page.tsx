import { IProductWithUnitsSold } from '@/Nenichat/Products/domain/IProduct';
import { SupabaseProductRepository } from '@/Nenichat/Products/infra/persistance/SupabaseProductRepository';
import { ProductActions } from './ProductActions';
import { Metadata } from 'next/dist/lib/metadata/types/metadata-interface';
import ProductsList from '@/components/products/products-list';
import { PageHeader } from '@/components/ui/page-header';
import Content from '@/components/layout/content';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';
import { EmptyList } from '@/components/empty-list';
import { Package } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Productos',
}
export const dynamic = 'force-dynamic';

/**
 * @function ProductsPage
 * @description A server component page to display a list of products.
 *              Fetches product data directly from the SupabaseProductRepository.
 */
export default async function ProductsPage() {
  let products: IProductWithUnitsSold[] = [];
  let error: string | null = null;

  try {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
      error = authError || 'Unauthorized';
    } else {
      const productRepository = new SupabaseProductRepository(supabase);

      products = await productRepository.getAll(business.id);

      // sort by is_active true first, is_active false second
      products.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));
      products = JSON.parse(JSON.stringify(products));
    }
  } catch (err: any) {
    console.error('Error fetching products in server component:', err);
    error = 'Failed to load products.';
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  if (products.length === 0) {
    return (
      <>
        <PageHeader />
        <EmptyList
          title="Sin productos"
          description="Cuando agregues tu primer producto aparecerá aquí."
          action={<ProductActions />}
          icon={<Package className="w-16 h-16 text-primary" strokeWidth={1.5} />}
        />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Productos">
        {products.length === 0 &&
          <ProductActions />
        }
      </PageHeader>
      <ProductsList />
    </>
  );
}
