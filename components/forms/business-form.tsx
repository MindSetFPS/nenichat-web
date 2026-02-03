
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';

interface BusinessFormProps {
    initialData?: {
        id?: number;
        name: string;
        email: string;
    } | null;
    onSuccess?: (business: any) => void;
    onCancel?: () => void;
}

/**
 * @function BusinessForm
 * @description A form component for creating or editing a business.
 */
export function BusinessForm({ initialData, onSuccess, onCancel }: BusinessFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
    });
    const supabase = createBrowserSupabaseClient();

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
                owner_id: user.id
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

            toast.success(initialData?.id ? '¡Negocio actualizado con éxito!' : '¡Negocio creado con éxito!');
            if (onSuccess) onSuccess(business);
        } catch (error: any) {
            console.error('Error saving business:', error);
            toast.error(error.message || 'Ocurrió un error al guardar el negocio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <Button type="submit" disabled={loading}>
                    {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                    {initialData?.id ? 'Actualizar Negocio' : 'Crear Negocio'}
                </Button>
            </div>
        </form>
    );
}
