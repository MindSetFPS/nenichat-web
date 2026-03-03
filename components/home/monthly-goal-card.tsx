"use client";

import { motion } from "motion/react";
import { Target, Trophy } from "lucide-react";
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
        <div className="relative overflow-hidden">
            {/* Gamified Background glow if met */}
            {isGoalMet && (
                <div className="absolute inset-0 bg-linear-to-tr from-green-500/10 to-emerald-500/5 animate-pulse rounded-2xl" />
            )}

            <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    {isGoalMet ? (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                    ) : (
                        <Target className="h-4 w-4 text-primary" />
                    )}
                    Meta del Mes
                </h3>
                <span className="text-xs font-bold px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                    {progress.toFixed(0)}%
                </span>
            </div>

            <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-end">
                    <p className="text-2xl font-bold tracking-tight">
                        ${currentRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                        de ${goalRevenue.toLocaleString()}
                    </p>
                </div>

                {/* Progress Bar Container */}
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn(
                            "h-full rounded-full relative",
                            isGoalMet
                                ? "bg-linear-to-r from-emerald-400 to-green-500"
                                : "bg-linear-to-r from-primary/60 to-primary"
                        )}
                    >
                        {/* Shimmer effect inside the bar */}
                        <div className="absolute top-0 bottom-0 left-0 right-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    </motion.div>
                </div>

                <p className="text-xs text-muted-foreground mt-2 text-center">
                    {isGoalMet
                        ? "¡Felicidades! Has alcanzado tu meta."
                        : `Faltan $${(goalRevenue - currentRevenue).toLocaleString('en-US', { maximumFractionDigits: 2 })} para lograrlo.`}
                </p>
            </div>
        </div>
    );
}
