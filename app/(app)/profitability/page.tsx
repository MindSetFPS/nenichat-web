"use client";

import { useState, useEffect } from "react";
import { ProfitMetricsCards } from "@/components/profitability/profit-metrics-cards";
import { ProfitabilityChart } from "@/components/profitability/profitability-chart";
import { ExpenseBreakdownChart } from "@/components/profitability/expense-breakdown-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IProfitabilityReport } from "@/Nenichat/Expenses/app/dto/IProfitabilityReport";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import Content from "@/components/layout/content";

export default function ProfitabilityPage() {
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<IProfitabilityReport | null>(null);

    // Default to current month
    const now = new Date();
    const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);

    useEffect(() => {
        fetchReport();
    }, [startDate, endDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/analytics/profitability?start_date=${startDate}&end_date=${endDate}`
            );
            const data = await response.json();
            setReport(data);
        } catch (error) {
            console.error('Error fetching profitability report:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Content className="p-4 scroll-auto overflow-y-auto">
            <PageHeader title="Rentabilidad">
                <Link href="/expenses/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Registrar gasto
                    </Button>
                </Link>
            </PageHeader>

            <div className="overflow-y-auto space-y-2">
                {/* Date Range Selector */}
                <Card className="flex justify-between flex-col md:flex-row">
                    <CardHeader className="w-full align-middle items-center">
                        <CardTitle className="w-full">Período de Análisis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Fecha Inicio</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">Fecha Fin</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : report ? (
                    <>
                        {/* Metrics Cards */}
                        <ProfitMetricsCards
                            revenue={report.revenue}
                            expenses={report.expenses}
                            profit={report.profit}
                            profitMargin={report.profitMargin}
                        />

                        {/* Revenue vs Expenses Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ingresos vs Gastos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProfitabilityChart
                                    revenueByDay={report.revenueByDay}
                                    expensesByDay={report.expensesByDay}
                                />
                            </CardContent>
                        </Card>

                        {/* Expense Breakdown */}
                        <ExpenseBreakdownChart expensesByCategory={report.expensesByCategory} />

                        {/* Additional Insights */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Análisis Adicional</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Ratio Gastos/Ingresos</p>
                                        <p className="text-2xl font-bold">
                                            {report.revenue > 0
                                                ? ((report.expenses / report.revenue) * 100).toFixed(1)
                                                : '0.0'}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Punto de Equilibrio</p>
                                        <p className="text-2xl font-bold">
                                            ${report.expenses.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Ingresos necesarios para cubrir gastos
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No se pudo cargar el reporte de rentabilidad
                    </div>
                )}
            </div>
        </Content>
    );
}
