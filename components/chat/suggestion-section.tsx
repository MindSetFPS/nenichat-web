"use client"

import type { ReactNode } from "react"
import { SuggestionPill } from "./suggestion-pill"
import type { SuggestionAction } from "@/Nenichat/Suggestions/domain/ISuggestionAction"

interface SuggestionSectionProps {
    icon: ReactNode
    title: string
    variant: "text" | "form"
    suggestions: SuggestionAction[]
    disabled?: boolean
    onClick: (suggestion: SuggestionAction) => void
    trailingSkeletonCount?: number
}

export function SuggestionSection({ icon, title, variant, suggestions, disabled, onClick, trailingSkeletonCount }: SuggestionSectionProps) {
    if (suggestions.length === 0 && !trailingSkeletonCount) return null

    return (
        <div>
            <div className="flex items-center gap-1.5 px-1 mb-1.5">
                {icon}
                <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">{title}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {suggestions.map((suggestion, index) => (
                    <SuggestionPill
                        key={`${variant}-${index}`}
                        suggestion={suggestion}
                        index={index}
                        variant={variant}
                        disabled={disabled}
                        onClick={onClick}
                    />
                ))}
                {trailingSkeletonCount && trailingSkeletonCount > 0 && (
                    Array.from({ length: trailingSkeletonCount }).map((_, i) => (
                        <div key={`skel-${variant}-${i}`} className="h-9 w-24 bg-muted animate-pulse rounded-full" />
                    ))
                )}
            </div>
        </div>
    )
}
