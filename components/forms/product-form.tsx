'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { IProduct } from '@/Nenichat/Products/domain/IProduct';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { SupabaseProductRepository } from '@/Nenichat/Products/infra/persistance/SupabaseProductRepository';
import { getBusinessFromUser } from '@/lib/user-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface ProductFormProps {
  product?: IProduct;
  businessId?: number;
  onSuccess?: (productId: string) => void;
  onCancel?: () => void;
}

export function ProductForm({ product, businessId, onSuccess, onCancel }: ProductFormProps) {
  const isEditMode = !!product;
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const productRepository = new SupabaseProductRepository(supabase);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [whatsappProductId, setWhatsappProductId] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false);

  useEffect(() => {
    if (isEditMode && product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setIsActive(product.is_active);
      setWhatsappProductId(product.whatsapp_product_id || '');
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setIsActive(true);
      setWhatsappProductId('');
    }
  }, [product, isEditMode]);

  const handleProductDelete = async () => {
    if (!product) return;

    setLoading(true);
    try {
      let bId: number;
      if (businessId) {
        bId = businessId;
      } else {
        const { business, error: authError } = await getBusinessFromUser(supabase);
        if (authError || !business) throw new Error(authError || 'Business not found');
        bId = business.id;
      }

      await productRepository.delete(bId, product.id);

      toast('Success!', {
        description: 'Product deleted successfully.',
      });

      router.push('/products');
      router.refresh();
    } catch (error: any) {
      toast('Error', {
        description: error.message,
      });
      setLoading(false);
    } finally {
      setShowDeleteProductDialog(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let bId: number;
      if (businessId) {
        bId = businessId;
      } else {
        const { business, error: authError } = await getBusinessFromUser(supabase);
        if (authError || !business) throw new Error(authError || 'Business not found');
        bId = business.id;
      }

      const productData = {
        name,
        description: description || null,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        whatsapp_product_id: whatsappProductId || null,
        is_active: isActive,
        images: product?.images || []
      };

      let resultProduct;

      if (isEditMode) {
        resultProduct = await productRepository.update(bId, product.id, productData);
        if (!resultProduct) throw new Error('Failed to update product');
      } else {
        resultProduct = await productRepository.create(bId, productData);
      }

      toast('Success!', {
        description: `Product ${isEditMode ? 'updated' : 'created'} successfully.`,
      });

      if (onSuccess) {
        onSuccess(resultProduct.id);
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error('Product error:', error);
      toast('Error', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 overflow-scroll py-2">
      <div className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="name">Nombre del producto</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="price">Precio</Label>
            <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="whatsappProductId">WhatsApp Product ID (Opcional)</Label>
          <Input id="whatsappProductId" value={whatsappProductId} onChange={(e) => setWhatsappProductId(e.target.value)} />
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
          <Label htmlFor="is-active">Activo</Label>
        </div>
      </div>

      <div className="flex justify-between items-center">
        {isEditMode ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteProductDialog(true)}
            disabled={loading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar producto
          </Button>
        ) : (
          <div></div> // Spacer
        )}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? (isEditMode ? 'Guardando...' : 'Creando...') : (isEditMode ? 'Guardar cambios' : 'Crear producto')}
          </Button>
        </div>
      </div>

      {isEditMode && (
        <>
          <AlertDialog open={showDeleteProductDialog} onOpenChange={setShowDeleteProductDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar producto?</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que quieres eliminar <strong>{product?.name}</strong>? Esta acción no puede ser deshecha.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleProductDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </form>
  );
}
