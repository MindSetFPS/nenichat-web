"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { IOrdersReport } from "@/Nenichat/Orders/domain/IOrdersReport";

interface OrdersTotalChartProps {
    data: IOrdersReport[];
}

export function OrdersTotalChart({ data }: OrdersTotalChartProps) {
    const chartConfig = {
        total: {
            label: "$",
            color: "hsl(142, 76%, 36%)",
        },
    };

    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />

                <Bar dataKey="total" radius={8} fill="var(--color-total)">
                    <LabelList
                        position="top"
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value: number | string | Array<number | string>) => `$${value}`}
                    />L
                </Bar>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
            </BarChart>
        </ChartContainer>
    );
}
