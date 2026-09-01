import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/forms/product-form';
import { IProduct } from '@/Nenichat/Products/domain/IProduct';
import { ChartBarLabel } from '@/components/products/chart';
import { ProductOrdersByDate } from '@/Nenichat/Products/app/dto/product-orders-by-date';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';
import { SupabaseProductRepository } from '@/Nenichat/Products/infra/persistance/SupabaseProductRepository';

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return <div>Unauthorized</div>;
  }

  const productRepository = new SupabaseProductRepository(supabase);
  const product = await productRepository.getById(business.id, id);

  const order_items = await productRepository.getProductSales(business.id, id);

  const salesMap = new Map<string, { display: string; quantity: number }>();
  for (const item of order_items) {
    const d = item.created_at;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const display = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const existing = salesMap.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      salesMap.set(key, { display, quantity: item.quantity });
    }
  }

  const sales: ProductOrdersByDate[] = Array.from(salesMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ date: v.display, quantity: v.quantity }));

  if (!product) {
    notFound();
  }

  const plainProduct: IProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    is_active: product.is_active,
    whatsapp_product_id: product.whatsapp_product_id,
    created_at: product.created_at,
    updated_at: product.updated_at,
    images: product.images,
  }

  return (
    <>
      <PageHeader title={plainProduct.name}>
        <Badge variant={plainProduct.is_active ? "default" : "secondary"}>
          {plainProduct.is_active ? "Activo" : "Inactivo"}
        </Badge>
      </PageHeader>
      <div className="overflow-y-auto mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <ProductForm product={plainProduct} businessId={business.id} />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <ChartBarLabel data={sales} />
          </div>
        </div>
      </div>
    </>
  );
}


