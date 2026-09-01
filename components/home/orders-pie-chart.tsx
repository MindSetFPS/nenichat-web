"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
]

const chartConfig: ChartConfig = {
    value: {
        label: "Value",
    },
}

interface OrdersPieChartProps {
    data: { product_name: string; count: number }[];
}

export function DailyOrdersChart({ data }: OrdersPieChartProps) {
    const [date, setDate] = useState("")

    useEffect(() => {
        setDate(new Date().toLocaleDateString())
    }, [])

    const chartData = data.map((order, index) => ({
        name: order.product_name,
        value: Number(order.count),
        fill: COLORS[index % COLORS.length],
    }))

    chartData.forEach((item, index) => {
        chartConfig[item.name] = {
            label: item.name,
            color: item.fill,
        }
    })

    return (
        <Card
            className="flex flex-col overflow-hidden shadow-none bg-white dark:bg-zinc-900/50 backdrop-blur-sm"
        >
            <CardHeader className="items-center pb-0">
                <CardTitle>Ventas del día</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto max-h-[350px]"
                >
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            right: 16,
                        }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                            hide
                        />
                        <XAxis dataKey="value" type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Bar
                            dataKey="value"
                            layout="vertical"
                            fill="var(--color-desktop)"
                            radius={4}
                        >
                            <LabelList
                                dataKey="name"
                                position="insideLeft"
                                offset={8}
                                className="fill-(--color-label)"
                                fontSize={16}
                            />
                            <LabelList
                                dataKey="value"
                                position="right"
                                offset={8}
                                className="fill-foreground"
                                fontSize={20}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
