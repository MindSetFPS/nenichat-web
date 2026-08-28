import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MonthlyUsage {
    year: number;
    month: number;
    promptTokens: number;
    completionTokens: number;
}

export interface DailyUsage {
    date: string;
    promptTokens: number;
    completionTokens: number;
}

interface TokenUsageState {
    monthlyUsage: MonthlyUsage[];
    dailyUsage: DailyUsage[];
    addUsage: (promptTokens: number, completionTokens: number) => void;
}

function getCurrentMonthKey(): { year: number; month: number } {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function getTodayKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export const useTokenUsageStore = create<TokenUsageState>()(
    persist(
        (set, get) => ({
            monthlyUsage: [],
            dailyUsage: [],

            addUsage: (promptTokens, completionTokens) => {
                const { year, month } = getCurrentMonthKey();
                const today = getTodayKey();
                set((state) => {
                    const existingMonthly = state.monthlyUsage.find(
                        (u) => u.year === year && u.month === month
                    );
                    const existingDaily = state.dailyUsage.find((u) => u.date === today);
                    return {
                        monthlyUsage: existingMonthly
                            ? state.monthlyUsage.map((u) =>
                                u.year === year && u.month === month
                                    ? {
                                        ...u,
                                        promptTokens: u.promptTokens + promptTokens,
                                        completionTokens: u.completionTokens + completionTokens,
                                    }
                                    : u
                            )
                            : [
                                ...state.monthlyUsage,
                                { year, month, promptTokens, completionTokens },
                            ],
                        dailyUsage: existingDaily
                            ? state.dailyUsage.map((u) =>
                                u.date === today
                                    ? {
                                        ...u,
                                        promptTokens: u.promptTokens + promptTokens,
                                        completionTokens: u.completionTokens + completionTokens,
                                    }
                                    : u
                            )
                            : [
                                ...state.dailyUsage,
                                { date: today, promptTokens, completionTokens },
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

export function getDailyUsageForMonth(dailyUsage: DailyUsage[], year: number, month: number): DailyUsage[] {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return dailyUsage
        .filter((d) => d.date.startsWith(prefix))
        .sort((a, b) => a.date.localeCompare(b.date));
}

export function formatDateShort(dateStr: string): string {
    const [, month, day] = dateStr.split('-');
    return `${parseInt(day)}/${parseInt(month)}`;
}

export interface ModelPricing {
    name: string;
    inputPer1M: number;
    outputPer1M: number;
}

export const MODEL_PRICING: ModelPricing[] = [
    { name: "gpt-oss:20b", inputPer1M: 0.02, outputPer1M: 0.10 },
    { name: "gpt-oss:120b", inputPer1M: 0.03, outputPer1M: 0.17 },
    { name: "Deepseek V4 Flash", inputPer1M: 0.03931, outputPer1M: 0.7089 },
    { name: "gpt-5 mini", inputPer1M: 0.1657, outputPer1M: 1.99 },
    { name: "GPT-5.4 Nano", inputPer1M: 0.1068, outputPer1M: 1.259 },
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
