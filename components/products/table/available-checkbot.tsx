"use client";

import { Switch } from "@/components/ui/switch";
import { IProduct } from "@/Nenichat/Products/domain/IProduct";
import { useState } from "react";
import { toast } from "sonner";

export function AvailableCheckbot({ product }: { product: IProduct }) {
    const [checked, setChecked] = useState(product.is_active);


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