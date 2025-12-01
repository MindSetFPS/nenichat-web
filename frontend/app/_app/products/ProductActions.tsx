'use client';

import { useRouter } from 'next/navigation';
import { CreateProductDialog } from '@/components/CreateProductDialog';

/**
 * @function ProductActions
 * @description A client component that provides actions related to products, such as creating a new product.
 */
export function ProductActions() {
  const router = useRouter();

  const handleProductCreated = (productId: string) => {
    router.push(`/products/${productId}`); // Redirect to the new product's detail page
  };

  return (
    <CreateProductDialog onProductCreated={handleProductCreated} />
  );
}
