"use client";

import { Card, CardContent } from "../ui/card";
import { Activity, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedCounter } from "../ui/animated-counter";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    description: string;
    trend?: string;
    isCurrency?: boolean;
    className?: string;
    delay?: number;
}

function StatCard({
    title,
    value,
    icon,
    description,
    trend,
    isCurrency,
    className,
    delay = 0,
}: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
        >
            <Card className={cn("overflow-hidden border-none shadow-md bg-white dark:bg-zinc-900/50 backdrop-blur-sm", className)}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            {icon}
                        </div>
                        {trend && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold">
                                <TrendingUp className="h-3 w-3" />
                                {trend}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                        <div className="text-2xl font-bold tracking-tight">
                            <AnimatedCounter
                                value={value}
                                prefix={isCurrency ? "$" : ""}
                                decimals={isCurrency ? 2 : 0}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 opacity-70">
                            {description}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

/**
 * @function BusinessSummary
 * @description Renders a high-level summary of business performance with animated metrics.
 */
export default function BusinessSummary({
    totalRevenue,
    totalOrders,
    activeOrders,
    totalOrdersValue
}: {
    totalRevenue: number;
    totalOrders: number;
    activeOrders: number;
    totalOrdersValue: number;
}) {
    if (totalOrders === 0) return null;

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total Revenue"
                value={totalRevenue}
                icon={<DollarSign className="h-5 w-5" />}
                description="Revenue from paid orders"
                trend="+12.5%"
                isCurrency
                delay={0.1}
            />
            <StatCard
                title="Total Orders"
                value={totalOrders}
                icon={<ShoppingBag className="h-5 w-5" />}
                description="Total completed transactions"
                trend="+8.2%"
                delay={0.2}
            />
            <StatCard
                title="Active Orders"
                value={activeOrders}
                icon={<Activity className="h-5 w-5" />}
                description="Orders currently in progress"
                className={activeOrders > 0 ? "ring-2 ring-primary/20" : ""}
                delay={0.3}
            />
            <StatCard
                title="Average Value"
                value={totalOrders > 0 ? totalRevenue / totalOrders : 0}
                icon={<TrendingUp className="h-5 w-5" />}
                description="Average revenue per order"
                isCurrency
                delay={0.4}
            />
        </div>
    );
}