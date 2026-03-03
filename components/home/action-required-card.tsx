"use client";

import { motion } from "motion/react";

interface ActionRequiredCardProps {
    activeOrders: number;
}

/**
 * @function ActionRequiredCard
 * @description A client component that displays an urgent call to action for pending orders with animations.
 */
export function ActionRequiredCard({ activeOrders }: ActionRequiredCardProps) {
    if (activeOrders === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl bg-primary text-primary-foreground shadow-lg relative overflow-hidden group mb-6"
        >
            <div className="relative z-10">
                <h3 className="text-lg font-bold mb-1">Attention Required</h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                    You have {activeOrders} orders waiting to be processed.
                </p>
                <button className="w-full py-2 bg-white text-primary rounded-xl font-bold text-sm transition-colors hover:bg-zinc-100">
                    Manage Orders
                </button>
            </div>
            {/* Decorative background circle */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
        </motion.div>
    );
}
