import { pool } from '@/Nenichat/Shared/infra/persistance/db';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/forms/product-form'; // Import the new edit form
import { IProduct } from '@/Nenichat/Products/domain/IProduct';
import { ChartBarLabel } from '@/components/products/chart';
import { ProductOrdersByDate } from '@/Nenichat/Products/app/dto/product-orders-by-date';
import { PageHeader } from '@/components/ui/page-header';
import Content from '@/components/layout/content';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';
import { SupabaseProductRepository } from '@/Nenichat/Products/infra/persistance/SupabaseProductRepository';

/**
 * @function ProductEditPage
 * @description A server component page to display and allow editing of a single product.
 * @param {Object} props - The props for the component.
 * @param {Object} props.params - The route parameters, containing the product ID.
 * @param {string} props.params.id - The ID of the product to display.
 */
export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return <div>Unauthorized</div>;
  }

  const productRepository = new SupabaseProductRepository(supabase);
  const product = await productRepository.getById(business.id, id);

  // get sales by date include order table with join table in order_id column
  const order_items = await pool.query(
    `SELECT oi.quantity, o.id as order_id, o.created_at FROM order_items oi
    JOIN orders o ON oi.order_id = o.id 
    WHERE oi.product_id = $1 AND o.business_id = $2`,
    [id, business.id]
  );

  const sales: ProductOrdersByDate[] = [];
  for (const item of order_items.rows) {
    // format date to "lunes 23 de diciembre"
    const date = item.created_at.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      weekday: 'long',
    });
    const quantity = item.quantity;

    const existingSale = sales.find((sale) => sale.date === date);
    if (existingSale) {
      existingSale.quantity += quantity;
    } else {
      sales.push({ date, quantity });
    }
  }

  if (!product) {
    notFound(); // Render Next.js 404 page if product not found
  }

  let plainProduct: IProduct = {
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
    <Content className="p-4 scroll-auto overflow-y-auto">
      <PageHeader title="Editar producto" />
      <div className="overflow-y-auto mt-2">
        <ChartBarLabel data={sales} />
        <ProductForm product={plainProduct} />
      </div>
    </Content>
  );
}


