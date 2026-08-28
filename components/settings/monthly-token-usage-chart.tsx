"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { useTokenUsageStore, formatMonth } from "@/stores/token-usage-store"

const chartConfig = {
    promptTokens: {
        label: "Input",
        color: "hsl(220, 98%, 61%)",
    },
    completionTokens: {
        label: "Output",
        color: "hsl(160, 84%, 39%)",
    },
} satisfies ChartConfig

export function MonthlyTokenUsageChart() {
    const monthlyUsage = useTokenUsageStore((s) => s.monthlyUsage)

    const sorted = [...monthlyUsage]
        .sort((a, b) => a.year - b.year || a.month - b.month)
        .map((m) => ({
            ...m,
            label: formatMonth(m.year, m.month),
            total: m.promptTokens + m.completionTokens,
        }))

    const totalTokens = sorted.reduce((acc, m) => acc + m.total, 0)
    const avgMonthly = sorted.length > 0 ? Math.round(totalTokens / sorted.length) : 0

    return (
        <div className="w-full space-y-3">
            <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Uso mensual de tokens</p>
                {sorted.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        Promedio: <span className="font-mono">{avgMonthly.toLocaleString("en-US")}</span> tokens/mes
                    </p>
                )}
            </div>

            {sorted.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-50 w-full">
                    <BarChart accessibilityLayer data={sorted} barGap={0}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value: number) => {
                                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
                                return `${value}`
                            }}
                            width={45}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) => (
                                        <span className="font-mono">
                                            {Number(value).toLocaleString("en-US")} {name === "promptTokens" ? "in" : "out"}
                                        </span>
                                    )}
                                />
                            }
                        />
                        <Bar
                            dataKey="promptTokens"
                            fill="var(--color-promptTokens)"
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar
                            dataKey="completionTokens"
                            fill="var(--color-completionTokens)"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            ) : (
                <div className="flex items-center justify-center h-50 text-muted-foreground text-sm">
                    Sin datos de uso aún
                </div>
            )}
        </div>
    )
}
