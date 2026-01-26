"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ExpenseCategoryFormProps {
    initialData?: {
        id?: number;
        name: string;
        description?: string;
        color: string;
        is_active: boolean;
    };
    onSubmit?: () => void;
}

const PRESET_COLORS = [
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Púrpura', value: '#8B5CF6' },
    { name: 'Ámbar', value: '#F59E0B' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Rojo', value: '#EF4444' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Índigo', value: '#6366F1' },
    { name: 'Gris', value: '#6B7280' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Naranja', value: '#F97316' },
];

export function ExpenseCategoryForm({ initialData, onSubmit }: ExpenseCategoryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        color: initialData?.color || "#3B82F6",
        is_active: initialData?.is_active ?? true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = initialData?.id
                ? `/api/expense-categories/${initialData.id}`
                : '/api/expense-categories';

            const method = initialData?.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description || null,
                    color: formData.color,
                    is_active: formData.is_active
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save category');
            }

            if (onSubmit) {
                onSubmit();
            }

            router.push('/expense-categories');
            router.refresh();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Error al guardar la categoría. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Ej: Marketing, Inventario, Servicios"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                    id="description"
                    placeholder="Describe qué tipo de gastos incluye esta categoría"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2 flex-wrap mb-2">
                    {PRESET_COLORS.map((preset) => (
                        <button
                            key={preset.value}
                            type="button"
                            className={`w-10 h-10 rounded-full border-2 transition-all ${formData.color === preset.value
                                    ? 'border-primary scale-110'
                                    : 'border-transparent hover:scale-105'
                                }`}
                            style={{ backgroundColor: preset.value }}
                            onClick={() => setFormData({ ...formData, color: preset.value })}
                            title={preset.name}
                        />
                    ))}
                </div>
                <div className="flex gap-2 items-center">
                    <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-20 h-10"
                    />
                    <Input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#3B82F6"
                        className="flex-1"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    id="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                    Categoría activa
                </Label>
            </div>

            <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData?.id ? 'Actualizar Categoría' : 'Crear Categoría'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancelar
                </Button>
            </div>
        </form>
    );
}
