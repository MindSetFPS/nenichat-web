"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Order } from "@/Nenichat/Orders/domain/Order"
import { formatCurrency, getPaymentStatusColor, getStatusColor, cn } from "@/lib/utils"
import { Package, Truck, CreditCard, Receipt, FileText, ChevronRight } from "lucide-react"

interface OrderMessageProps {
    order: Order,
    isGroup: boolean
}

export default function OrderMessage({ order, isGroup }: OrderMessageProps) {
    return (
        <Link
            href={`/orders/${order.id}`}
            className={cn(
                "block group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20",
                "rounded-lg border bg-card text-card-foreground shadow-sm", // Rounded-lg for slightly tighter corners
                "w-[260px]", // Reduced width slightly to force compactness
                isGroup && "ml-10"
            )}
        >
            {/* Compact Header: ID & Status */}
            <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2 text-[11px] font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <Package className="size-3" />
                    #{order.id}
                </span>
                <Badge variant="outline" className={cn("px-1.5 py-0 text-[10px] h-4 leading-none uppercase tracking-wider border", getStatusColor(order.status))}>
                    {order.status}
                </Badge>
            </div>

            {/* Main Content */}
            <div className="p-3 space-y-2">
                {/* Hero Row: Total & Payment Status */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total</span>
                        <span className="text-lg font-bold leading-none text-foreground tracking-tight">
                            {formatCurrency(order.total_amount)}
                        </span>
                    </div>
                    <Badge variant="secondary" className={cn("px-2 py-0.5 h-auto text-[10px] capitalize font-medium border", getPaymentStatusColor(order.payment_status))}>
                        {order.payment_status}
                    </Badge>
                </div>

                {/* Secondary Info Grid - Only show if relevant */}
                {(order.shipping_cost > 0 || (order.amount_paid > 0 && order.payment_status !== 'paid')) && (
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-2 border-t border-border/50 text-[11px]">
                        {order.shipping_cost > 0 && (
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="flex items-center gap-1 opacity-80"><Truck className="size-3" /> Envío</span>
                                <span className="font-medium text-foreground">{formatCurrency(order.shipping_cost)}</span>
                            </div>
                        )}
                        {order.amount_paid > 0 && order.payment_status !== 'paid' && (
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="flex items-center gap-1 opacity-80"><Receipt className="size-3" /> Abonado</span>
                                <span className="font-medium text-foreground">{formatCurrency(order.amount_paid)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Micro Notes */}
                {order.notes && (
                    <div className="pt-2 border-t border-border/50 flex gap-1.5 items-start text-[10px] text-muted-foreground/90">
                        <FileText className="size-3 mt-0.5 shrink-0 opacity-60" />
                        <p className="line-clamp-1 leading-tight">{order.notes}</p>
                    </div>
                )}
            </div>

            {/* Subtle corner accent for interaction */}
            <div className="absolute right-0 bottom-0 size-6 bg-gradient-to-tl from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    )
}
