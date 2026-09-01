'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProductForm } from '@/components/forms/product-form';
import { PlusCircle } from 'lucide-react';

/**
 * @function CreateProductDialog
 * @description A dialog component that contains the form for creating a new product.
 * @param {Object} props - The props for the component.
 * @param {(productId: string) => void} props.onProductCreated - Callback function to be called after a product is successfully created.
 */
export function CreateProductDialog({ onProductCreated }: { onProductCreated: (productId: string) => void }) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (productId: string) => {
    setOpen(false);
    onProductCreated(productId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Agrega un producto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agrega un producto</DialogTitle>
          <DialogDescription>
            Llena los detalles para crear un nuevo producto.
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
