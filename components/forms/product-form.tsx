'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { IProduct } from '@/Nenichat/Products/domain/IProduct';
import { IImage } from '@/dto/IImage';
import { getProductImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { XCircle, PlusCircle, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface ProductFormProps {
  product?: IProduct;
  onSuccess?: (productId: string) => void;
  onCancel?: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEditMode = !!product;
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [whatsappProductId, setWhatsappProductId] = useState('');
  const [existingImages, setExistingImages] = useState<IImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageToDelete, setImageToDelete] = useState<IImage | null>(null);
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false);

  const newImagePreviews = useMemo(() => {
    return newImages.map((file) => URL.createObjectURL(file));
  }, [newImages]);

  useEffect(() => {
    if (isEditMode && product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setIsActive(product.is_active);
      setWhatsappProductId(product.whatsapp_product_id || '');
      setExistingImages(product.images || []);
      setNewImages([]);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setIsActive(true);
      setWhatsappProductId('');
      setExistingImages([]);
      setNewImages([]);
    }
  }, [product, isEditMode]);

  const handleImageDelete = async () => {
    if (!imageToDelete || !product) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/products/${product.id}?imageId=${imageToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }

      toast('Success!', {
        description: 'Image deleted successfully.',
      });
      setExistingImages((prev) => prev.filter((img) => img.id !== imageToDelete.id));
      router.refresh();
    } catch (error: any) {
      toast('Error', {
        description: error.message,
      });
    } finally {
      setLoading(false);
      setImageToDelete(null);
    }
  };

  const handleProductDelete = async () => {
    if (!product) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

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

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('is_active', isActive.toString());
    formData.append('whatsapp_product_id', whatsappProductId);

    if (isEditMode) {
      existingImages.forEach((img) => formData.append('existingImageIds', img.id));
    }

    if (newImages.length > 0) {
      const imageKey = isEditMode ? 'newImages' : 'images';
      newImages.forEach((file) => {
        formData.append(imageKey, file);
      });
    }

    try {
      const url = isEditMode ? `/api/products/${product?.id}` : '/api/products';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'create'} product`);
      }

      const resultProduct = await response.json();

      toast('Success!', {
        description: `Product ${isEditMode ? 'updated' : 'created'} successfully.`,
      });

      if (onSuccess) {
        onSuccess(resultProduct.id);
      } else {
        router.refresh();
      }
    } catch (error: any) {
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

        <CardTitle className='mt-4'>Imagenes</CardTitle>
        <CardDescription>Sube imágenes para tu producto.</CardDescription>
        <div className="grid grid-cols-3 gap-2">
          {isEditMode &&
            existingImages.map((image) => (
              <div key={image.id} className="relative w-full h-24 border rounded-md overflow-hidden group">
                <Image src={getProductImageUrl(image.path)} alt={image.alt_text || 'Product image'} fill style={{ objectFit: 'cover' }} />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setImageToDelete(image)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
          {newImagePreviews.map((previewUrl, index) => (
            <div key={index} className="relative w-full h-24 border rounded-md overflow-hidden group">
              <Image src={previewUrl} alt={`New image ${index + 1}`} fill style={{ objectFit: 'cover' }} onLoad={() => URL.revokeObjectURL(previewUrl)} />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeNewImage(index)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Label
            htmlFor="newImages"
            className="relative w-full h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
          >
            <PlusCircle className="h-6 w-6 mb-1" />
            <span>Agregar imágenes</span>
            <Input id="newImages" type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleNewImageChange} />
          </Label>
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
          <AlertDialog open={!!imageToDelete} onOpenChange={() => setImageToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar imagen?</AlertDialogTitle>
                <AlertDialogDescription>Esta acción no puede ser deshecha. Esta acción eliminará permanentemente la imagen.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleImageDelete}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showDeleteProductDialog} onOpenChange={setShowDeleteProductDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar producto?</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que quieres eliminar <strong>{product?.name}</strong>? Esta acción no puede ser deshecha y eliminará permanentemente el producto y todas sus imágenes.
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
