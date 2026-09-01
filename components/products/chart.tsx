"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
    desktop: {
        label: "Ventas",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

interface ChartProps {
    data: {
        date: string,
        quantity: number
    }[]
}

export function ChartBarLabel({ data }: ChartProps) {
    if (data.length === 0) {
        return (
            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium text-foreground">Historial de ventas</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Ventas por día</p>
                </div>
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                    <p className="text-sm">No hay ventas registradas</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div>
                <h3 className="text-sm font-medium text-foreground">Historial de ventas</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Ventas por día</p>
            </div>
            <ChartContainer config={chartConfig} className="w-full h-52">
                <BarChart
                    accessibilityLayer
                    data={data}
                    margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
                    barCategoryGap="20%"
                >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent cursor={true} />}
                    />
                    <Bar
                        dataKey="quantity"
                        fill="var(--color-desktop)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                    >
                        <LabelList
                            position="top"
                            offset={8}
                            className="fill-muted-foreground"
                            fontSize={11}
                        />
                    </Bar>
                </BarChart>
            </ChartContainer>
        </div>
    )
}
