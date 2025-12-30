"use client";

import { Calendar } from "lucide-react";
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
        { value: "7", label: "7 días" },
        { value: "14", label: "14 días" },
        { value: "30", label: "30 días" },
    ];

    return (
        <ButtonGroup>
            {intervals.map((interval) => (
                <Button
                    key={interval.value}
                    variant="default"
                    className={cn(
                        selectedInterval === interval.value ? "bg-blue-600" : ""
                    )}
                    onClick={() => {
                        onIntervalChange(interval.value);
                    }}
                >
                    <Calendar className="size-4" />
                    {interval.label}
                </Button>
            ))}
        </ButtonGroup>
    );
}