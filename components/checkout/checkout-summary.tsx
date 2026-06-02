import { Check } from "lucide-react";
import type { Plan } from "@/stores/plan-store";

interface CheckoutSummaryProps {
    plan: Plan;
    features: string[];
}

export function CheckoutSummary({ plan, features }: CheckoutSummaryProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Plan seleccionado</h2>
                <h3 className="text-2xl font-black mt-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            </div>

            <div>
                <span className="text-4xl font-black">${plan.price}</span>
                <span className="text-muted-foreground"> MXN / mes</span>
            </div>

            <div className="border-t pt-6">
                <h4 className="text-sm font-bold mb-4">Incluye:</h4>
                <ul className="space-y-3">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-bold">${plan.price} MXN</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">IVA</span>
                    <span className="font-bold">Incluido</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-base">
                    <span className="font-bold">Total</span>
                    <span className="font-black">${plan.price} MXN</span>
                </div>
            </div>
        </div>
    );
}
