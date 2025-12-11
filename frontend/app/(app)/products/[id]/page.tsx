import { ProductRepository } from '@/Nenichat/Products/infra/persistance/ProductRepository';
import { pool } from '@/Nenichat/Shared/infra/persistance/db';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/forms/ProductForm'; // Import the new edit form
import { IProduct } from '@/Nenichat/Products/domain/IProduct';
import { PageHeader } from '@/components/ui/page-header';

const productRepository = new ProductRepository(pool);

/**
 * @function ProductEditPage
 * @description A server component page to display and allow editing of a single product.
 * @param {Object} props - The props for the component.
 * @param {Object} props.params - The route parameters, containing the product ID.
 * @param {string} props.params.id - The ID of the product to display.
 */
export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await productRepository.getById(id);

  if (!product) {
    notFound(); // Render Next.js 404 page if product not found
  }

  let plainProduct: IProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    whatsapp_product_id: product.whatsapp_product_id,
    created_at: product.created_at,
    updated_at: product.updated_at,
    images: product.images,
  }

  return (
    <>
      <PageHeader content={<h1 className='font-bold'>Edit product</h1>} />
      <ProductForm product={plainProduct} />
    </>
  );
}


