'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { IProduct, IProductWithUnitsSold } from '@/Nenichat/Products/domain/IProduct';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Loader2, Trash2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { SupabaseProductRepository } from '@/Nenichat/Products/infra/persistance/SupabaseProductRepository';
import { getBusinessFromUser } from '@/lib/user-auth';
import { useProductStore } from '@/stores/product-store';
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
  const { addProduct, updateProduct, deleteProduct } = useProductStore();

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
      deleteProduct(product.id);

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
        updateProduct(resultProduct as IProductWithUnitsSold);
      } else {
        resultProduct = await productRepository.create(bId, productData);
        addProduct(resultProduct as IProductWithUnitsSold);
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
    <form onSubmit={handleSubmit} className="space-y-0">
      {/* Name Section */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">Nombre del producto</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Nombre que verán tus clientes</p>
        </div>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Camiseta Básica Blanca"
          required
          className="max-w-md"
        />
      </div>

      <Separator className="my-6" />

      {/* Description Section */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">Descripción</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Detalla las características del producto</p>
        </div>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe tu producto..."
          rows={5}
          className="max-w-md"
        />
      </div>

      <Separator className="my-6" />

      {/* Images Section */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">Imágenes del producto</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Imágenes que aparecerán en tu tienda</p>
        </div>
        {product?.images && product.images.length > 0 ? (
          <div className="flex gap-3 flex-wrap">
            {product.images.map((image) => (
              <div
                key={image.id}
                className="relative w-28 h-28 rounded-lg overflow-hidden border bg-muted"
              >
                <Image
                  src={image.path}
                  alt={image.alt_text || product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
            <button
              type="button"
              className="w-28 h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:bg-muted/50 hover:border-muted-foreground/30 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-[11px]">Agregar</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-2 w-full max-w-xs h-32 rounded-lg border-2 border-dashed text-muted-foreground hover:bg-muted/50 hover:border-muted-foreground/30 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs">Agregar imágenes</span>
          </button>
        )}
      </div>

      <Separator className="my-6" />

      {/* Pricing & Inventory Row */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">Precio e inventario</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Configura el precio y stock disponible</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs text-muted-foreground">Precio</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stock" className="text-xs text-muted-foreground">Stock</Label>
            <Input
              id="stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* WhatsApp Section */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">WhatsApp</h3>
          <p className="text-xs text-muted-foreground mt-0.5">ID del producto en catálogo de WhatsApp (opcional)</p>
        </div>
        <Input
          id="whatsappProductId"
          value={whatsappProductId}
          onChange={(e) => setWhatsappProductId(e.target.value)}
          placeholder="ID del producto"
          className="max-w-md"
        />
      </div>

      <Separator className="my-6" />

      {/* Status Section */}
      <div className="space-y-3">
        <div className="md:flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Estado</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Los productos inactivos no son visibles en la tienda</p>
          </div>
          <div className="flex items-center gap-2.5 mt-2 md:mt-0">
            <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="is-active" className="text-sm font-medium text-muted-foreground cursor-pointer">
              {isActive ? 'Activo' : 'Inactivo'}
            </Label>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        {isEditMode ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteProductDialog(true)}
            disabled={loading}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        ) : (
          <div />
        )}
        <div className="flex gap-3">
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
      )}
    </form>
  );
}
