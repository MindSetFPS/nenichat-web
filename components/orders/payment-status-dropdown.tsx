"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, getPaymentStatusColor } from "@/lib/utils";
import { IOrder } from "@/Nenichat/Orders/domain/IOrder";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

interface PaymentStatusDropdownProps {
    order: IOrder;
}

// order.payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded'

export default function PaymentStatusDropdown({ order }: PaymentStatusDropdownProps) {
    const router = useRouter();
    const [status, setStatus] = useState(order.payment_status);

    const handleStatusChange = async (newStatus: string) => {
        const originalStatus = status;
        setStatus(newStatus as IOrder["payment_status"]); // Optimistic update

        try {
            const response = await fetch(`/api/orders/${order.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payment_status: newStatus,
                    total_amount: order.total_amount,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update payment status');
            }

            toast.success("Estado de pago actualizado");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar estado de pago");
            setStatus(originalStatus); // Revert on error
        }
    };

    return (
        <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger 
                className={cn(getPaymentStatusColor(status), "cursor-pointer rounded-full text-xs py-0 h-6! font-bold ")}
                onClick={(e) => e.stopPropagation()}
            >
                <SelectValue placeholder={status} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="unpaid">Pago pendiente</SelectItem>
                <SelectItem value="partial">Pagado parcialmente</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
            </SelectContent>
        </Select>
    )
}