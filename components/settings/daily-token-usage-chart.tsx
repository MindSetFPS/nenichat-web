"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { useTokenUsageStore, getDailyUsageForMonth, formatMonth, estimateCost, formatCost } from "@/stores/token-usage-store"

const chartConfig = {
    promptTokens: {
        label: "Input",
        color: "hsl(220, 98%, 61%)",
    },
    completionTokens: {
        label: "Output",
        color: "hsl(160, 84%, 39%)",
    },
    cost: {
        label: "Costo",
        color: "hsl(45, 93%, 47%)",
    },
} satisfies ChartConfig

export function DailyTokenUsageChart() {
    const dailyUsage = useTokenUsageStore((s) => s.dailyUsage)
    const monthlyUsage = useTokenUsageStore((s) => s.monthlyUsage)

    const availableMonths = [...monthlyUsage]
        .sort((a, b) => b.year - a.year || b.month - a.month)

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [selectedMonth, setSelectedMonth] = useState(currentMonth)

    const dailyData = getDailyUsageForMonth(dailyUsage, selectedYear, selectedMonth)
        .map((d) => ({ ...d, cost: estimateCost(d.promptTokens, d.completionTokens) }))
    const totalPrompt = dailyData.reduce((acc, d) => acc + d.promptTokens, 0)
    const totalCompletion = dailyData.reduce((acc, d) => acc + d.completionTokens, 0)
    const avgPrompt = dailyData.length > 0 ? Math.round(totalPrompt / dailyData.length) : 0
    const avgCompletion = dailyData.length > 0 ? Math.round(totalCompletion / dailyData.length) : 0
    const totalCost = dailyData.reduce((acc, d) => acc + d.cost, 0)

    return (
        <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">Uso diario de tokens</p>
                    {dailyData.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Promedio: <span className="font-mono">{avgPrompt.toLocaleString("en-US")}</span> in · <span className="font-mono">{avgCompletion.toLocaleString("en-US")}</span> out / día
                        </p>
                    )}
                    {dailyData.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Gastado este mes: <span className="font-mono font-bold">{formatCost(totalCost)}</span>
                        </p>
                    )}
                </div>
                <select
                    value={`${selectedYear}-${selectedMonth}`}
                    onChange={(e) => {
                        const [y, m] = e.target.value.split("-").map(Number)
                        setSelectedYear(y)
                        setSelectedMonth(m)
                    }}
                    className="text-xs bg-background border border-border rounded-md px-2 py-1 text-foreground cursor-pointer"
                >
                    {availableMonths.length > 0 ? (
                        availableMonths.map((m) => (
                            <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                                {formatMonth(m.year, m.month)}
                            </option>
                        ))
                    ) : (
                        <option value={`${currentYear}-${currentMonth}`}>
                            {formatMonth(currentYear, currentMonth)}
                        </option>
                    )}
                </select>
            </div>

            {dailyData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <BarChart accessibilityLayer data={dailyData} barGap={0}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value: string) => {
                                const [, , day] = value.split("-")
                                return `${parseInt(day)}`
                            }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value: number) => {
                                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
                                return `${value}`
                            }}
                            width={40}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(label) => {
                                        const [, month, day] = (label as string).split("-")
                                        return `${parseInt(day)}/${parseInt(month)}`
                                    }}
                                    formatter={(value, name) => {
                                        if (name === "cost") {
                                            return <span className="font-mono">{formatCost(Number(value))}</span>
                                        }
                                        return (
                                            <span className="font-mono">
                                                {Number(value).toLocaleString("en-US")} {name === "promptTokens" ? "in" : "out"}
                                            </span>
                                        )
                                    }}
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
                        >
                            <LabelList
                                dataKey="cost"
                                position="top"
                                formatter={(value: number) => formatCost(value)}
                                className="fill-muted-foreground text-[9px]"
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                    Sin datos para este mes
                </div>
            )}
        </div>
    )
}
