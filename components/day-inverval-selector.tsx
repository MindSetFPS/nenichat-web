"use client";

import { Calendar, Check } from "lucide-react";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { cn } from "@/lib/utils";

export function DayIntervalSelector({
    onIntervalChange,
    selectedInterval
}: {
    onIntervalChange: (interval: string) => void;
    selectedInterval: string;
}) {
    const intervals = [
        { value: "today", label: "Hoy" },
        { value: "this-week", label: "Semana" },
        { value: "this-month", label: "Mes" },
        { value: "this-year", label: "Año" },
    ];

    return (
        <ButtonGroup className="mb-2">
            {intervals.map((interval) => (
                <Button
                    key={interval.value}
                    variant="outline"
                    className={cn(
                        selectedInterval === interval.value ? "bg-blue-600! text-white" : ""
                    )}
                    onClick={() => {
                        onIntervalChange(interval.value);
                    }}
                >
                    {selectedInterval === interval.value && <Calendar className="size-4" />}

                    {interval.label}
                </Button>
            ))}
        </ButtonGroup>
    );
}