"use client"

import { ClipboardList } from "lucide-react"
import { motion } from "motion/react"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"
import type { SuggestionAction } from "@/Nenichat/Suggestions/domain/ISuggestionAction"

interface SuggestionPillProps {
    suggestion: SuggestionAction
    index: number
    variant: "text" | "form"
    disabled?: boolean
    onClick: (suggestion: SuggestionAction) => void
}

export function SuggestionPill({ suggestion, index, variant, disabled, onClick }: SuggestionPillProps) {
    const isForm = variant === "form"

    return (
        <motion.div
            className="min-w-0 max-w-full"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.04 }}
        >
            <Button
                variant={isForm ? "default" : "outline"}
                size="sm"
                onClick={() => onClick(suggestion)}
                className={cn(
                    "cursor-pointer rounded-full text-xs py-1.5 h-auto max-w-full whitespace-normal text-pretty transition-all duration-300",
                    isForm
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                        : "bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/40"
                )}
                disabled={disabled}
            >
                {isForm && <ClipboardList className="w-3 h-3 mr-1 shrink-0" />}
                {suggestion.label}
            </Button>
        </motion.div>
    )
}
