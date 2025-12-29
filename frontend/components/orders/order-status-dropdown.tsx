"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, getStatusColor } from "@/lib/utils";
import { IOrder } from "@/Nenichat/Orders/domain/IOrder";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

interface OrderStatusDropdownProps {
    order: IOrder;
}

export default function OrderStatusDropdown({ order }: OrderStatusDropdownProps) {
    const router = useRouter();
    const [status, setStatus] = useState(order.status);

    const handleStatusChange = async (newStatus: string) => {
        const originalStatus = status;
        setStatus(newStatus as IOrder["status"]); // Optimistic update

        try {
            const response = await fetch(`/api/orders/${order.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            toast.success("Estado del pedido actualizado");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar estado del pedido");
            setStatus(originalStatus); // Revert on error
        }
    };

    return (
        <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className={cn(getStatusColor(status), "rounded-full text-xs py-0 h-6! font-bold ")}>
                <SelectValue placeholder={status} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
        </Select>
    )
}
