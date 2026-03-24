"use client"
import { format, parseISO } from "date-fns"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function OrderProductChart({ data }: { data: { date: string; quantity: number }[] }) {
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold">Productos vendidos</h2>
            <p>Promedio: {Math.ceil(data.reduce((acc, item) => acc + item.quantity, 0) / data.length)}</p>
            <ChartContainer config={chartConfig}>
                <BarChart
                    accessibilityLayer
                    data={data}
                    margin={{
                        top: 20,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => format(parseISO(value), "MMM d")}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="quantity" fill="var(--color-desktop)" radius={8}>
                        <LabelList
                            position="top"
                            offset={12}
                            className="fill-foreground"
                            fontSize={12}
                        />
                    </Bar>
                </BarChart>
            </ChartContainer>
        </div>
    )
}
