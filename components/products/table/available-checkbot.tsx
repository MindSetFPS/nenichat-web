"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { IProductWithUnitsSold } from "@/Nenichat/Products/domain/IProduct";
import { useProductStore } from "@/stores/product-store";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function AvailableCheckbot({ product }: { product: IProductWithUnitsSold }) {
    const [checked, setChecked] = useState(product.is_active);
    const updateProduct = useProductStore((state) => state.updateProduct);
    const supabase = createBrowserSupabaseClient();

    const handleCheckedChange = async (checked: boolean) => {
        setChecked(checked);
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_active: checked })
                .eq('id', product.id);

            if (error) throw error;

            updateProduct({
                ...product,
                is_active: checked,
            });
        } catch (error) {
            console.error('Error updating product:', error);
            setChecked(!checked);
            toast('Error', {
                description: 'Failed to update product.',
            });
        }
    };

    return (
        <Switch checked={checked} onCheckedChange={handleCheckedChange} />
    )
}