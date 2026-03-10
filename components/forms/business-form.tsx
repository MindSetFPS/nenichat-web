
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Camera, X } from 'lucide-react';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useBusinessStore, type Business } from '@/stores/business-store';

interface BusinessFormProps {
    initialData?: {
        id?: number;
        name: string;
        email: string;
        business_logo_url?: string | null;
    } | null;
    onSuccess?: (business: Business) => void;
    onCancel?: () => void;
}

/**
 * @function BusinessForm
 * @description A form component for creating or editing a business.
 */
export function BusinessForm({ initialData, onSuccess, onCancel }: BusinessFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.business_logo_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createBrowserSupabaseClient();
    const { setBusiness, updateBusiness } = useBusinessStore();

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Por favor selecciona un archivo de imagen');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no puede superar los 5MB');
            return;
        }

        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setLogoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadLogo = async (businessId: number): Promise<string | null> => {
        if (!logoFile) return initialData?.business_logo_url || null;

        setUploadingImage(true);
        try {
            const fileName = `logo-${businessId}-${Date.now()}.${logoFile.name.split('.').pop()}`;
            
            const { error: uploadError } = await supabase.storage
                .from('business')
                .upload(fileName, logoFile, {
                    contentType: logoFile.type,
                    upsert: true,
                });

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('business')
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast.error('Error al subir la imagen');
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                throw new Error('No estás autenticado');
            }

            const businessData = {
                name: formData.name,
                email: formData.email || user.email,
                owner_id: user.id,
                business_logo_url: initialData?.business_logo_url || null,
            };

            let result;
            if (initialData?.id) {
                // Update existing business
                result = await supabase
                    .from('business')
                    .update(businessData)
                    .eq('id', initialData.id)
                    .select()
                    .single();
            } else {
                // Create new business
                result = await supabase
                    .from('business')
                    .insert([businessData])
                    .select()
                    .single();
            }

            const { data: business, error: dbError } = result;

            if (dbError) {
                throw new Error(dbError.message);
            }

            // Upload logo if selected
            const logoUrl = await uploadLogo(business.id);
            if (logoUrl) {
                await supabase
                    .from('business')
                    .update({ business_logo_url: logoUrl })
                    .eq('id', business.id);
                business.business_logo_url = logoUrl;
            } else if (!logoFile && initialData?.business_logo_url === null) {
                // User removed the logo
                await supabase
                    .from('business')
                    .update({ business_logo_url: null })
                    .eq('id', business.id);
                business.business_logo_url = null;
            }

            toast.success(initialData?.id ? '¡Negocio actualizado con éxito!' : '¡Negocio creado con éxito!');
            
            if (initialData?.id) {
                updateBusiness(business);
            } else {
                setBusiness(business);
            }
            
            if (onSuccess) onSuccess(business);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ocurrió un error al guardar el negocio';
            console.error('Error saving business:', error);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Business Logo</Label>
                <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                        {logoPreview ? (
                            <>
                                <Image
                                    src={logoPreview}
                                    alt="Business logo"
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeLogo}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-gray-600"
                            >
                                <Camera className="w-8 h-8 mb-1" />
                                <span className="text-xs">Add Logo</span>
                            </button>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                    />
                    <div className="text-sm text-gray-500">
                        <p>JPG, PNG, WebP or GIF</p>
                        <p>Max 5MB</p>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="name">Business Name</Label>
                <Input
                    id="name"
                    placeholder="Enter business name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Business Email (Optional)</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="Enter business email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={loading || uploadingImage}>
                    {loading || uploadingImage ? <Spinner className="mr-2 h-4 w-4" /> : null}
                    {initialData?.id ? 'Actualizar Negocio' : 'Crear Negocio'}
                </Button>
            </div>
        </form>
    );
}
