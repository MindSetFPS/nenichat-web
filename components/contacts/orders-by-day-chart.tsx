"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface OrdersByDayChartProps {
    data: { day_index: number; count: number }[];
}

export function OrdersByDayChart({ data }: OrdersByDayChartProps) {
    const dayNames = {
        1: 'Lun',
        2: 'Mar',
        3: 'Mie',
        4: 'Jue',
        5: 'Vie',
        6: 'Sab',
        7: 'Dom',
    };

    // Fill in missing days
    const fullData = Array.from({ length: 7 }, (_, i) => {
        const dayIndex = i + 1;
        const found = data.find(d => d.day_index === dayIndex);
        return {
            day: dayNames[dayIndex as keyof typeof dayNames],
            count: found ? found.count : 0,
        };
    });

    const chartConfig = {
        count: {
            label: "Ordenes",
            color: "hsl(var(--primary))",
        },
    };

    return (
        <div className="w-full">
            <h2 className="text-sm font-medium text-gray-100 mb-2">Ordenes por dia</h2>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={fullData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="day"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar dataKey="count" radius={4} fill="var(--chart-2)">
                        <LabelList
                            position="top"
                            offset={12}
                            className="fill-green"
                            fontSize={12}
                        />
                    </Bar>
                </BarChart>
            </ChartContainer>
        </div>
    );
}
