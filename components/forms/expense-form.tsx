"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IExpenseCategory } from "@/Nenichat/Expenses/domain/IExpenseCategory";
import { Loader2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface ExpenseFormProps {
    categories: IExpenseCategory[];
    initialData?: {
        id?: number;
        category_id: number;
        amount: number;
        description: string;
        vendor?: string;
        payment_method?: string;
        notes?: string;
        expense_date: string;
    };
    onSubmit?: () => void;
    businessId: number;
}

export function ExpenseForm({ categories, initialData, onSubmit, businessId }: ExpenseFormProps) {
    const router = useRouter();
    const supabase = createBrowserSupabaseClient();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        category_id: initialData?.category_id?.toString() || "",
        amount: initialData?.amount?.toString() || "",
        description: initialData?.description || "",
        vendor: initialData?.vendor || "",
        payment_method: initialData?.payment_method || "",
        notes: initialData?.notes || "",
        expense_date: initialData?.expense_date || new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                category_id: parseInt(formData.category_id),
                amount: parseFloat(formData.amount),
                description: formData.description,
                vendor: formData.vendor || null,
                payment_method: formData.payment_method || null,
                receipt_url: null,
                notes: formData.notes || null,
                expense_date: formData.expense_date,
                business_id: businessId
            };

            if (initialData?.id) {
                const { error } = await supabase
                    .from('expenses')
                    .update(data)
                    .eq('id', initialData.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('expenses')
                    .insert(data);

                if (error) throw error;
            }

            if (onSubmit) {
                onSubmit();
            }

            router.push('/expenses');
            router.refresh();
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Error al guardar el gasto. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;

        const confirmed = confirm('¿Estás seguro de que quieres eliminar este gasto? Esta acción no se puede deshacer.');
        if (!confirmed) return;

        setLoading(true);

        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', initialData.id);

            if (error) throw error;

            router.push('/expenses');
            router.refresh();
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert('Error al eliminar el gasto. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
                <Label htmlFor="category_id">Categoría *</Label>
                <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    {category.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount">Monto *</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                    id="description"
                    placeholder="¿En qué se gastó el dinero?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="vendor">Proveedor</Label>
                <Input
                    id="vendor"
                    type="text"
                    placeholder="Nombre del proveedor o tienda"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="payment_method">Método de pago</Label>
                <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona un método" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="transfer">Transferencia</SelectItem>
                        <SelectItem value="card">Tarjeta</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="expense_date">Fecha del gasto *</Label>
                <Input
                    id="expense_date"
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                    id="notes"
                    placeholder="Notas adicionales (opcional)"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
            </div>

            <div className="flex gap-4 justify-between">
                <div className="flex gap-4">
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData?.id ? 'Actualizar Gasto' : 'Crear Gasto'}
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
                {initialData?.id && (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Eliminar
                    </Button>
                )}
            </div>
        </form>
    );
}
