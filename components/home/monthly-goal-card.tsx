"use client";

import { motion } from "motion/react";
import { Target, Trophy, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MonthlyGoalCard({
    currentRevenue = 0,
    goalRevenue = 10000
}: {
    currentRevenue: number;
    goalRevenue?: number;
}) {
    const progress = Math.min((currentRevenue / goalRevenue) * 100, 100);
    const isGoalMet = progress >= 100;

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    {isGoalMet ? (
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        >
                            <Trophy className="h-5 w-5 text-amber-500" />
                        </motion.div>
                    ) : (
                        <Target className="h-4 w-4 text-primary" />
                    )}
                    Meta del Mes
                </h3>
                {isGoalMet ? (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="text-xs font-medium px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center gap-1.5"
                    >
                        <CheckCircle2 className="h-3 w-3" />
                        Completado
                    </motion.span>
                ) : (
                    <span className="text-xs font-bold px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                        {progress.toFixed(0)}%
                    </span>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <p className={cn(
                        "text-2xl font-bold tracking-tight transition-colors",
                        isGoalMet && "text-green-600 dark:text-green-400"
                    )}>
                        ${currentRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                        de ${goalRevenue.toLocaleString()}
                    </p>
                </div>

                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn(
                            "h-full rounded-full relative",
                            isGoalMet
                                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                : "bg-gradient-to-r from-primary/60 to-primary"
                        )}
                    >
                        {isGoalMet && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-white/30"
                            />
                        )}
                    </motion.div>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={cn(
                        "text-xs mt-2 text-center",
                        isGoalMet
                            ? "text-green-600 dark:text-green-400 font-medium"
                            : "text-muted-foreground"
                    )}
                >
                    {isGoalMet
                        ? "¡Felicidades! Has alcanzado tu meta."
                        : `Faltan $${(goalRevenue - currentRevenue).toLocaleString('en-US', { maximumFractionDigits: 2 })} para lograrlo.`}
                </motion.p>
            </div>
        </div>
    );
}
