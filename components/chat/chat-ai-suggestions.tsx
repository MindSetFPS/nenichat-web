"use client"

import { useState, useEffect, useMemo } from "react"
import { Sparkles, RotateCw, ChevronUp, ChevronDown, ClipboardList, MessageSquareText } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"
import { useSuggestionFetcher } from "@/hooks/use-suggestion-fetcher"
import { SuggestionSection } from "./suggestion-section"
import type { SuggestionAction } from "@/Nenichat/Suggestions/domain/ISuggestionAction"
import type { IContact } from "@/Nenichat/Contacts/domain/IContact"

interface ChatAiSuggestionsProps {
    lastMessages?: any[]
    onSuggestionClick: (suggestion: string) => void
    onSuggestionAction?: (action: SuggestionAction) => void
    disabled?: boolean
    me?: IContact | null
    suggestions?: SuggestionAction[]
    textSuggestionCount?: number
    orderSuggestionCount?: number
}

export function ChatAiSuggestions({
    lastMessages,
    onSuggestionClick,
    onSuggestionAction,
    disabled,
    me,
    suggestions: initialSuggestions,
    textSuggestionCount = 2,
    orderSuggestionCount = 2,
}: ChatAiSuggestionsProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const { suggestions, pendingCount, isReloading, tokenStats, reload } = useSuggestionFetcher({
        lastMessages,
        initialSuggestions,
        textSuggestionCount,
        orderSuggestionCount,
    })

    const textSuggestions = useMemo(() => suggestions.filter(s => s.action === "send_message"), [suggestions])
    const formSuggestions = useMemo(() => suggestions.filter(s => s.action === "open_form"), [suggestions])

    useEffect(() => {
        const stored = localStorage.getItem("chat-ai-suggestions-expanded")
        if (stored !== null) {
            setIsExpanded(stored === "true")
        }
    }, [])

    const toggleExpanded = () => {
        const newState = !isExpanded
        setIsExpanded(newState)
        localStorage.setItem("chat-ai-suggestions-expanded", String(newState))
    }

    const handleReload = () => {
        if (!isExpanded) toggleExpanded()
        reload()
    }

    const handleSuggestionClick = (suggestion: SuggestionAction) => {
        if (suggestion.action === "send_message") {
            onSuggestionClick(suggestion.text)
        } else if (suggestion.action === "open_form") {
            onSuggestionAction?.(suggestion)
        }
    }

    useEffect(() => {
        const lastMessage = lastMessages?.[0]
        const isFromCustomer = lastMessage && (
            lastMessage.sender_jid !== me?.lid && lastMessage.sender_jid !== me?.phone_number
        )
        if (isFromCustomer) {
            // TODO: auto-fetch suggestions when a new customer message arrives
        }
    }, [lastMessages, me?.id])

    const hasMessages = lastMessages && lastMessages.length > 0

    return (
        <div className="mb-2">
            <div className="flex items-center justify-between mb-2 px-1">
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={toggleExpanded}
                >
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Respuestas rápidas</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="default"
                        className="hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        onClick={handleReload}
                        disabled={disabled || isReloading || !hasMessages}
                        title="Recargar sugerencias"
                    >
                        <RotateCw className={cn("w-3.5 h-3.5", isReloading && "animate-spin")} />
                        <span>
                            {isReloading ? "Analizando..." : "Analizar chat"}
                        </span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        onClick={toggleExpanded}
                        title={isExpanded ? "Contraer" : "Expandir"}
                    >
                        {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                        )}
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {isReloading && suggestions.length === 0 && pendingCount > 0 ? (
                            <div className="flex flex-wrap gap-1.5 pb-2">
                                {Array.from({ length: pendingCount }).map((_, i) => (
                                    <div key={`skel-${i}`} className="h-9 w-24 bg-muted animate-pulse rounded-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <SuggestionSection
                                    icon={<MessageSquareText className="w-3 h-3 text-muted-foreground/50" />}
                                    title="Respuestas"
                                    variant="text"
                                    suggestions={textSuggestions}
                                    disabled={disabled}
                                    onClick={handleSuggestionClick}
                                    trailingSkeletonCount={isReloading ? pendingCount : undefined}
                                />
                                <SuggestionSection
                                    icon={<ClipboardList className="w-3 h-3 text-primary/60" />}
                                    title="Pedidos detectados"
                                    variant="form"
                                    suggestions={formSuggestions}
                                    disabled={disabled}
                                    onClick={handleSuggestionClick}
                                />
                            </div>
                        )}
                        {tokenStats && !isReloading && (
                            <div className="text-[10px] text-muted-foreground/60 text-right px-1 pt-1.5">
                                {tokenStats.promptTokens} input · {tokenStats.completionTokens} output
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
