"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Content from "@/components/layout/content";
import { PageHeader } from "@/components/ui/page-header";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { PaymentForm } from "@/components/checkout/payment-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePlanStore, getPlanById, PLANS } from "@/stores/plan-store";
import type { PlanId } from "@/stores/plan-store";

const PLAN_FEATURES: Record<string, string[]> = {
    "neni-flow": [
        "Pedidos automatizados ilimitados",
        "Respuestas inteligentes a clientes",
        "Soporte prioritario",
        "Análisis de ventas automatizado",
    ],
    "empresaria": [
        "Pedidos automatizados ilimitados",
        "Respuestas inteligentes a clientes",
        "Soporte prioritario",
        "Análisis de ventas automatizado",
        "Hasta 5 usuarios con roles y permisos",
        "Conversaciones ilimitadas",
    ],
};

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { currentPlan, upgradePlan } = usePlanStore();

    const planParam = searchParams.get("plan") as PlanId | null;
    const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(
        planParam && planParam !== "starter" ? planParam : "neni-flow"
    );

    const availablePlans = PLANS.filter(p => p.id !== "starter" && p.id !== currentPlan);

    if (availablePlans.length === 0) {
        return (
            <Content className="p-4 md:p-8">
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold">Ya tienes el mejor plan</h2>
                    <p className="text-muted-foreground mt-2">Actualmente estás en el plan {getPlanById(currentPlan).name}.</p>
                </div>
            </Content>
        );
    }

    const selectedPlan = getPlanById(selectedPlanId);
    const features = PLAN_FEATURES[selectedPlanId] || [];

    const handleSelectPlan = (planId: PlanId) => {
        setSelectedPlanId(planId);
        router.replace(`/checkout?plan=${planId}`, { scroll: false });
    };

    const handleSuccess = () => {
        upgradePlan(selectedPlanId);
        router.push("/home?settings=true&section=billing");
    };

    return (
        <Content className="p-4 md:p-8 overflow-y-auto">
            <PageHeader title="Finalizar Compra" />

            {/* Plan Selector */}
            {availablePlans.length > 1 && (
                <div className="mt-8">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Selecciona tu plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availablePlans.map((p) => {
                            const isSelected = p.id === selectedPlanId;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleSelectPlan(p.id)}
                                    className={cn(
                                        "relative text-left p-5 rounded-xl border-2 transition-all cursor-pointer",
                                        isSelected
                                            ? "border-primary bg-primary/5 shadow-md"
                                            : "border-border/50 bg-card hover:border-primary/50"
                                    )}
                                >
                                    {p.id === "neni-flow" && (
                                        <Badge className="absolute -top-2.5 right-4" variant="default">
                                            Más popular
                                        </Badge>
                                    )}
                                    <h4 className="text-lg font-black">{p.name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                                    <div className="mt-3">
                                        <span className="text-2xl font-black">${p.price}</span>
                                        <span className="text-muted-foreground text-xs"> MXN / mes</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Checkout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                <div className="lg:col-span-3">
                    <Card>
                        <CardContent className="p-6 md:p-8">
                            <PaymentForm
                                key={selectedPlanId}
                                amount={selectedPlan.price}
                                onSuccess={handleSuccess}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="bg-muted/30 border-muted">
                        <CardContent className="p-6">
                            <CheckoutSummary plan={selectedPlan} features={features} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Content>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<Content className="p-4 md:p-8"><div className="text-center py-20">Cargando...</div></Content>}>
            <CheckoutContent />
        </Suspense>
    );
}
