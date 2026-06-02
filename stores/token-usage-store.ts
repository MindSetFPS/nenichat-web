import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MonthlyUsage {
    year: number;
    month: number;
    promptTokens: number;
    completionTokens: number;
}

interface TokenUsageState {
    monthlyUsage: MonthlyUsage[];
    addUsage: (promptTokens: number, completionTokens: number) => void;
}

function getCurrentMonthKey(): { year: number; month: number } {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export const useTokenUsageStore = create<TokenUsageState>()(
    persist(
        (set, get) => ({
            monthlyUsage: [],

            addUsage: (promptTokens, completionTokens) => {
                const { year, month } = getCurrentMonthKey();
                set((state) => {
                    const existing = state.monthlyUsage.find(
                        (u) => u.year === year && u.month === month
                    );
                    if (existing) {
                        return {
                            monthlyUsage: state.monthlyUsage.map((u) =>
                                u.year === year && u.month === month
                                    ? {
                                        ...u,
                                        promptTokens: u.promptTokens + promptTokens,
                                        completionTokens: u.completionTokens + completionTokens,
                                    }
                                    : u
                            ),
                        };
                    }
                    return {
                        monthlyUsage: [
                            ...state.monthlyUsage,
                            { year, month, promptTokens, completionTokens },
                        ],
                    };
                });
            },
        }),
        {
            name: 'nenichat-token-usage',
        }
    )
);

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function formatMonth(year: number, month: number): string {
    return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function formatTokenCount(n: number): string {
    return n.toLocaleString('en-US');
}

export interface ModelPricing {
    name: string;
    inputPer1M: number;
    outputPer1M: number;
}

export const MODEL_PRICING: ModelPricing[] = [
    { name: "gpt-oss:20b",        inputPer1M: 0.03,   outputPer1M: 0.14 },
    { name: "gpt-oss:120b",       inputPer1M: 0.039,  outputPer1M: 0.18 },
    { name: "Deepseek V4 Flash",  inputPer1M: 0.0983, outputPer1M: 0.1966 },
    { name: "gpt-5 mini",         inputPer1M: 0.25,   outputPer1M: 2.0 },
];

export function computeCost(model: ModelPricing, promptTokens: number, completionTokens: number) {
    const inputCost = (promptTokens / 1_000_000) * model.inputPer1M;
    const outputCost = (completionTokens / 1_000_000) * model.outputPer1M;
    return {
        inputCost,
        outputCost,
        total: inputCost + outputCost,
    };
}
