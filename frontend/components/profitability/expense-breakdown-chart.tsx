"use client";

import { Pie, PieChart, Cell, Legend, ResponsiveContainer } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpenseBreakdownChartProps {
    expensesByCategory: Array<{
        category_id: number;
        category_name: string;
        category_color: string;
        amount: number;
        percentage: number;
    }>;
}

export function ExpenseBreakdownChart({ expensesByCategory }: ExpenseBreakdownChartProps) {
    if (expensesByCategory.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Gastos por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                        No hay gastos registrados en este período
                    </p>
                </CardContent>
            </Card>
        );
    }

    const chartData = expensesByCategory.map(cat => ({
        name: cat.category_name,
        value: cat.amount,
        color: cat.category_color,
        percentage: cat.percentage
    }));

    const chartConfig = expensesByCategory.reduce((acc, cat) => {
        acc[cat.category_name] = {
            label: cat.category_name,
            color: cat.category_color
        };
        return acc;
    }, {} as any);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gastos por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ percentage }) => `${percentage.toFixed(1)}%`}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <ChartTooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-background border rounded-lg p-2 shadow-lg">
                                            <p className="font-semibold">{payload[0].name}</p>
                                            <p className="text-sm">
                                                ${Number(payload[0].value).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {payload[0].payload.percentage.toFixed(1)}%
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ChartContainer>

                <div className="mt-4 space-y-2">
                    {expensesByCategory.map(cat => (
                        <div key={cat.category_id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: cat.category_color }}
                                />
                                <span>{cat.category_name}</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-medium">${cat.amount.toFixed(2)}</span>
                                <span className="text-muted-foreground">{cat.percentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
