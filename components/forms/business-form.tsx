
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Camera, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

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

    const uploadLogo = async (businessId: number): Promise<string | null | undefined> => {
        if (!logoFile) {
            // If there's no logo file and no preview, it was removed
            if (!logoPreview) return null;
            // If there's no logo file but there is a preview, it's unchanged
            return initialData?.business_logo_url;
        }

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

            // Upload logo if selected or handle removal
            const logoUrl = await uploadLogo(business.id);
            if (logoUrl !== undefined && logoUrl !== initialData?.business_logo_url) {
                await supabase
                    .from('business')
                    .update({ business_logo_url: logoUrl })
                    .eq('id', business.id);
                business.business_logo_url = logoUrl;
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
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo Section - Compact */}
            <div className="flex items-center gap-4 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div 
                    className={cn(
                        "group relative w-16 h-16 rounded-xl border-2 border-dashed transition-all duration-300 flex items-center justify-center overflow-hidden shrink-0",
                        logoPreview 
                            ? "border-zinc-200 dark:border-zinc-800" 
                            : "border-zinc-300 dark:border-zinc-700 hover:border-primary/50 bg-white dark:bg-zinc-950"
                    )}
                >
                    {logoPreview ? (
                        <>
                            <Image
                                src={logoPreview}
                                alt="Logo del negocio"
                                fill
                                className="object-cover group-hover:opacity-75 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                                <button
                                    type="button"
                                    onClick={removeLogo}
                                    className="bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 rounded-full p-1.5 hover:bg-white dark:hover:bg-zinc-900 shadow-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-full flex flex-col items-center justify-center text-zinc-400 group-hover:text-primary transition-colors"
                        >
                            <Camera className="w-5 h-5" />
                        </button>
                    )}
                </div>
                
                <div className="flex-1 min-w-0">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-1 block">Business Logo</Label>
                    <p className="text-[10px] text-zinc-500 truncate">JPG, PNG o WebP • Max 5MB</p>
                    {!logoPreview && (
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[10px] font-bold text-primary hover:underline mt-1"
                        >
                            Select File
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
            </div>

            {/* Form Fields - Compacted */}
            <div className="space-y-3">
                <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold text-zinc-600 dark:text-zinc-400 ml-1 uppercase tracking-tight">
                        Business Name
                    </Label>
                    <Input
                        id="name"
                        placeholder="Enter business name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-10 rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-primary/20 transition-all text-sm"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-zinc-600 dark:text-zinc-400 ml-1 uppercase tracking-tight">
                        Business Email (Optional)
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter business email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-10 rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-primary/20 transition-all text-sm"
                    />
                </div>
            </div>

            {/* Action Buttons - Streamlined */}
            <div className="flex items-center gap-2 pt-2">
                <Button 
                    type="submit" 
                    className="flex-1 h-11 rounded-lg font-bold text-sm shadow-md shadow-primary/10 transition-all hover:-translate-y-px active:translate-y-0" 
                    disabled={loading || uploadingImage}
                >
                    {loading || uploadingImage ? (
                        <Spinner className="mr-2 h-4 w-4" />
                    ) : (
                        <Upload className="mr-2 h-4 w-4" />
                    )}
                    {initialData?.id ? 'Actualizar Negocio' : 'Crear Negocio'}
                </Button>
                
                {onCancel && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={onCancel} 
                        disabled={loading}
                        className="h-11 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 px-4"
                    >
                        Cancelar
                    </Button>
                )}
            </div>
        </form>
    );
}
