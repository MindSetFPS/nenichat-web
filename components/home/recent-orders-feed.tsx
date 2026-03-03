"use client";

import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ShoppingBag, CheckCircle2, Clock } from "lucide-react";
import { IOrder } from "@/Nenichat/Orders/domain/IOrder";

export function RecentOrdersFeed({ orders }: { orders: IOrder[] }) {
    // Sort by created_at descending and take top 5
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

    if (recentOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <ShoppingBag className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Aún no hay pedidos recientes.</p>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-amber-500" />;
            case 'shipped':
            case 'delivered':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            default:
                return <ShoppingBag className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-4">
            {recentOrders.map((order, i) => (
                <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start justify-between p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                >
                    <div className="flex gap-3 items-start">
                        <div className="mt-1 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                            {getStatusIcon(order.status)}
                        </div>
                        <div>
                            <p className="font-medium text-sm">
                                Pedido #{order.id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: es })}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-sm text-green-600 dark:text-green-400">
                            ${Number(order.total_amount).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {order.status}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
