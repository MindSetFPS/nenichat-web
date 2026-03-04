"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
    className?: string;
}

/**
 * A reusable back button component that uses the browser history to navigate back.
 * Incorporates subtle micro-animations for a premium feel.
 */
export function BackButton({ className }: BackButtonProps) {
    const router = useRouter();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Go back"
            className={cn(
                "md:hidden hover:bg-accent/50 active:scale-95 transition-all duration-200",
                className
            )}
        >
            <ArrowLeft className="h-4 w-4" />
        </Button>
    );
}
