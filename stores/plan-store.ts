import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlanId = "starter" | "neni-flow" | "empresaria";

export interface Plan {
    id: PlanId;
    name: string;
    price: number;
    description: string;
}

export const PLANS: Plan[] = [
    {
        id: "starter",
        name: "Starter",
        price: 0,
        description: "Plan gratuito básico.",
    },
    {
        id: "neni-flow",
        name: "Neni Flow",
        price: 599,
        description: "Automatización de ventas ilimitada.",
    },
    {
        id: "empresaria",
        name: "Empresaria",
        price: 2499,
        description: "Multi-usuario y prioridad máxima.",
    },
];

interface PlanState {
    currentPlan: PlanId;
    upgradePlan: (planId: PlanId) => void;
}

export const usePlanStore = create<PlanState>()(
    persist(
        (set) => ({
            currentPlan: "starter",
            upgradePlan: (planId) => set({ currentPlan: planId }),
        }),
        {
            name: 'nenichat-plan',
        }
    )
);

export function getPlanById(id: PlanId): Plan {
    return PLANS.find(p => p.id === id) || PLANS[0];
}

export function getUpgradePlans(currentId: PlanId): Plan[] {
    const index = PLANS.findIndex(p => p.id === currentId);
    return PLANS.slice(index + 1);
}
