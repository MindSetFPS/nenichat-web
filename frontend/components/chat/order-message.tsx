"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Order } from "@/Nenichat/Orders/domain/Order"
import { formatCurrency, getPaymentStatusColor, getStatusColor } from "@/lib/utils"
import { ShineBorder } from "../ui/shine-border"

interface OrderMessageProps {
    order: Order,
    isGroup: boolean
}

export default function OrderMessage({ order, isGroup }: OrderMessageProps) {
    return (
        <Card className={isGroup ? "bg-foreground/5 relative mx-10" : "bg-foreground/5 relative"}>
            <ShineBorder className="absolute inset-0" shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />

            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-md font-bold">
                        <Link href={`/orders/${order.id}`}>
                            Orden #{order.id}
                        </Link>
                    </CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                        {order.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 flex flex-row justify-between">

                <div className="block text-sm">
                    <div className="text-muted-foreground">Total:</div>
                    <div className="font-semibold">{formatCurrency(order.total_amount)}</div>
                </div>

                {order.shipping_cost > 0 && (
                    <div className="block text-sm">
                        <div className="text-muted-foreground">Costo de envío:</div>
                        <div>{formatCurrency(order.shipping_cost)}</div>
                    </div>
                )}

                <div className="block text-sm">
                    <div className="text-muted-foreground">Estado de pago:</div>
                    <Badge variant="outline" className={getPaymentStatusColor(order.payment_status)}>
                        {order.payment_status}
                    </Badge>
                </div>

                {order.amount_paid > 0 && (
                    <div className="block text-sm">
                        <div className="text-muted-foreground">Pagado:</div>
                        <div>{formatCurrency(order.amount_paid)}</div>
                    </div>
                )}

                {order.notes && (
                    <div className="pt-2 border-t">
                        <div className="text-sm text-muted-foreground">
                            {order.notes}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
