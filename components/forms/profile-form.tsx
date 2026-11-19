"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserStore, type UserProfile } from '@/stores/user-store';

interface ProfileFormProps {
  initialData: UserProfile;
  onSuccess?: () => void;
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const router = useRouter();
  const fetchUser = useUserStore((state) => state.fetchUser);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData.name ?? '',
    last_name: initialData.last_name ?? '',
    email: initialData.email ?? '',
    phone: initialData.phone ?? '',
    birth_date: initialData.birth_date ?? '',
    country: initialData.country ?? '',
    avatar_url: initialData.avatar_url ?? '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'No se pudo actualizar el perfil');
      }

      await fetchUser(true);
      router.refresh();
      toast.success('Perfil actualizado correctamente');
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nombre" htmlFor="name">
          <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={isLoading} />
        </FormField>
        <FormField label="Apellido" htmlFor="last_name">
          <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} disabled={isLoading} />
        </FormField>
      </div>
      <FormField label="Correo" htmlFor="email">
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={isLoading} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Teléfono" htmlFor="phone">
          <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} disabled={isLoading} />
        </FormField>
        <FormField label="Fecha de nacimiento" htmlFor="birth_date">
          <Input id="birth_date" name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} disabled={isLoading} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="País" htmlFor="country">
          <Input id="country" name="country" value={formData.country} onChange={handleChange} disabled={isLoading} />
        </FormField>
        <FormField label="Avatar (URL)" htmlFor="avatar_url">
          <Input id="avatar_url" name="avatar_url" value={formData.avatar_url} onChange={handleChange} disabled={isLoading} />
        </FormField>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}

function FormField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
