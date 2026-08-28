'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { usePlanStore, getPlanById, PLANS } from "@/stores/plan-store"
import { useTokenUsageStore, formatMonth, formatTokenCount, MODEL_PRICING, computeCost } from "@/stores/token-usage-store"
import { DailyTokenUsageChart } from "./daily-token-usage-chart"
import { MonthlyTokenUsageChart } from "./monthly-token-usage-chart"

export function SubscriptionSettings() {
    const { currentPlan } = usePlanStore()
    const plan = getPlanById(currentPlan)
    const monthlyUsage = useTokenUsageStore((s) => s.monthlyUsage)
    const router = useRouter()

    const isPaid = plan.price > 0

    return (
        <div className="space-y-6 pb-10 w-full max-w-full">
            {/* Current Plan Card */}
            <Card className="bg-muted/30 border-none shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Plan actual</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-black">{plan.name}</span>
                                <Badge variant={isPaid ? "default" : "secondary"}>
                                    {isPaid ? "Activo" : "Gratuito"}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-black">
                                {isPaid ? `$${plan.price}` : "Gratis"}
                            </span>
                            {isPaid && <span className="text-muted-foreground text-xs"> MXN / mes</span>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card className="bg-muted/30 border-none shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Uso</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        <div>
                            <span className="text-2xl font-black">0</span>
                            <p className="text-xs text-muted-foreground mt-1">Pedidos este mes</p>
                        </div>
                        <div>
                            <span className="text-2xl font-black">—</span>
                            <p className="text-xs text-muted-foreground mt-1">Próximo corte</p>
                        </div>
                        <div>
                            <span className="text-2xl font-black">—</span>
                            <p className="text-xs text-muted-foreground mt-1">Facturas</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border">
                        <DailyTokenUsageChart />
                    </div>
                    <div className="mt-6 pt-6 border-t border-border">
                        <MonthlyTokenUsageChart />
                    </div>
                    {monthlyUsage.length > 0 && (() => {
                        const sorted = [...monthlyUsage].reverse();
                        const latest = sorted[0];
                        return (
                            <div className="mt-6 pt-6 border-t border-border space-y-4">
                                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Tokens (debug)</p>
                                {sorted.slice(0, 3).map((u) => (
                                    <div key={`${u.year}-${u.month}`} className="text-sm text-foreground/80">
                                        <span className="font-semibold">{formatMonth(u.year, u.month)}:</span>{' '}
                                        <span className="font-mono">{formatTokenCount(u.promptTokens)}</span> in ·{' '}
                                        <span className="font-mono">{formatTokenCount(u.completionTokens)}</span> out
                                    </div>
                                ))}
                                <div className="space-y-2 pt-2">
                                    <div className="grid grid-cols-4 gap-4 text-xs font-bold text-foreground/60 uppercase tracking-wider pb-2 border-b border-border/50">
                                        <span>Modelo</span>
                                        <span className="text-right">Input</span>
                                        <span className="text-right">Output</span>
                                        <span className="text-right">Total</span>
                                    </div>
                                    {MODEL_PRICING.map((m) => {
                                        const cost = computeCost(m, latest.promptTokens, latest.completionTokens);
                                        return (
                                            <div key={m.name} className="grid grid-cols-4 gap-4 text-sm text-foreground/80">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="font-medium underline decoration-dotted underline-offset-2 cursor-pointer">{m.name}</span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="text-xs">
                                                        <span className="font-mono">${m.inputPer1M}/M in · ${m.outputPer1M}/M out</span>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <span className="text-right font-mono">${cost.inputCost.toFixed(6)}</span>
                                                <span className="text-right font-mono">${cost.outputCost.toFixed(6)}</span>
                                                <span className="text-right font-mono font-bold">${cost.total.toFixed(6)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}
                    <p className="text-xs text-muted-foreground mt-4">
                        {isPaid
                            ? "Las estadísticas detalladas estarán disponibles pronto."
                            : "Activa Neni Flow para ver estadísticas de uso."
                        }
                    </p>
                </CardContent>
            </Card>

            {/* Plan Comparison */}
            <Card className="bg-muted/30 border-none shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Planes disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {PLANS.map((p) => {
                            const isCurrent = p.id === currentPlan;
                            const canUpgrade = !isCurrent && p.id !== "starter";
                            return (
                                <div
                                    key={p.id}
                                    className={`flex items-center justify-between p-3 rounded-xl border ${isCurrent
                                        ? "border-primary/50 bg-primary/5"
                                        : "border-border/50"
                                        }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {isCurrent && <Check className="h-4 w-4 text-primary shrink-0" />}
                                        <div className="min-w-0">
                                            <span className="font-bold text-sm">{p.name}</span>
                                            <span className="text-muted-foreground text-xs ml-2">
                                                {p.price === 0 ? "Gratis" : `$${p.price} MXN/mes`}
                                            </span>
                                        </div>
                                    </div>
                                    {isCurrent && (
                                        <Badge variant="outline" className="text-[10px] shrink-0">Actual</Badge>
                                    )}
                                    {canUpgrade && (
                                        <Button
                                            size="sm"
                                            className="rounded-xl shrink-0"
                                            onClick={() => router.push(`/checkout?plan=${p.id}`)}
                                        >
                                            Mejorar
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
