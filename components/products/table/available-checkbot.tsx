"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { IProductWithUnitsSold } from "@/Nenichat/Products/domain/IProduct";
import { useProductStore } from "@/stores/product-store";

export function AvailableCheckbot({ product }: { product: IProductWithUnitsSold }) {
    const [checked, setChecked] = useState(product.is_active);
    const updateProduct = useProductStore((state) => state.updateProduct);

    // when checked, make a post request to /api/products/id/active setting is_active to the new value
    const handleCheckedChange = async (checked: boolean) => {
        setChecked(checked);
        try {
            const response = await fetch(`/api/products/${product.id}/active`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    is_active: checked,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to update product');
            }
            // Update the product in the store with the new value
            updateProduct({
                ...product,
                is_active: checked,
            });
        } catch (error) {
            console.error('Error updating product:', error);
            toast('Error', {
                description: 'Failed to update product.',
            });
        }
    };

    return (
        <Switch checked={checked} onCheckedChange={(checked) => handleCheckedChange(checked)} />
    )
}