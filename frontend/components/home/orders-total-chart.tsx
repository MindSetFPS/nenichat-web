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

export function OrdersTotalValueChart({ data }: OrdersTotalChartProps) {
    const chartConfig = {
        total: {
            label: "",// Date
            color: "hsl(142, 76%, 36%)",
        },
    };

    return (
        data.length > 0 ? (
            <div className="w-full">
                <h2 className="text-2xl font-bold">Valor de ventas diario</h2>
                <h2>Promedio: ${(data.reduce((acc, item) => acc + item.total, 0) / data.length).toFixed(2)} por dia</h2>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                        />

                        <Bar dataKey="total" radius={8} fill="var(--color-total)">
                            <LabelList
                                position="top"
                                className="fill-foreground"
                                fontSize={12}
                                formatter={(value: number | string | Array<number | string>) => `$${value}`}
                            />
                        </Bar>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                    </BarChart>
                </ChartContainer>
            </div>
        ) : (
            <div className="w-full">
                <h2 className="text-2xl font-bold">Valor de ventas diario</h2>
                <h2>No hay datos</h2>
            </div>
        )
    );
}
