"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Percent } from "lucide-react";

interface ProfitMetricsCardsProps {
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
}

export function ProfitMetricsCards({ revenue, expenses, profit, profitMargin }: ProfitMetricsCardsProps) {
    const isProfit = profit >= 0;

    return (
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
            <Card className="py-2 gap-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium">
                        Ingresos Totales
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-bold text-green-600">
                        ${revenue.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Ventas pagadas
                    </p>
                </CardContent>
            </Card>

            <Card className="py-2 gap-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium">
                        Gastos Totales
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-bold text-red-600">
                        ${expenses.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Todos los gastos
                    </p>
                </CardContent>
            </Card>

            <Card className="py-2 gap-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium">
                        {isProfit ? 'Ganancia Neta' : 'Pérdida Neta'}
                    </CardTitle>
                    {isProfit ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                </CardHeader>
                <CardContent>
                    <div className={`text-lg font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(profit).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Ingresos - Gastos
                    </p>
                </CardContent>
            </Card>

            <Card className="py-2 gap-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium">
                        Margen de Ganancia
                    </CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-lg font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                        {profitMargin.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {isProfit ? 'Rentable' : 'No rentable'}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
