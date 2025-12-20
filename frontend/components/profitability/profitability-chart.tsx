"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface ProfitabilityChartProps {
    revenueByDay: Array<{ date: Date; amount: number }>;
    expensesByDay: Array<{ date: Date; amount: number }>;
}

export function ProfitabilityChart({ revenueByDay, expensesByDay }: ProfitabilityChartProps) {
    // Merge revenue and expenses by date
    const dateMap = new Map<string, { date: string; revenue: number; expenses: number }>();

    revenueByDay.forEach(item => {
        const dateStr = new Date(item.date).toISOString().split('T')[0];
        if (!dateMap.has(dateStr)) {
            dateMap.set(dateStr, { date: dateStr, revenue: 0, expenses: 0 });
        }
        dateMap.get(dateStr)!.revenue = item.amount;
    });

    expensesByDay.forEach(item => {
        const dateStr = new Date(item.date).toISOString().split('T')[0];
        if (!dateMap.has(dateStr)) {
            dateMap.set(dateStr, { date: dateStr, revenue: 0, expenses: 0 });
        }
        dateMap.get(dateStr)!.expenses = item.amount;
    });

    const chartData = Array.from(dateMap.values()).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const chartConfig = {
        revenue: {
            label: "Ingresos",
            color: "hsl(142, 76%, 36%)",
        },
        expenses: {
            label: "Gastos",
            color: "hsl(0, 84%, 60%)",
        },
    };

    return (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip
                    content={<ChartTooltipContent />}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={false}
                    name="Ingresos"
                />
                <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="var(--color-expenses)"
                    strokeWidth={2}
                    dot={false}
                    name="Gastos"
                />
            </LineChart>
        </ChartContainer>
    );
}
