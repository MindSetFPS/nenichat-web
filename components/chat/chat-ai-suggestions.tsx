"use client"

import { Sparkles, RotateCw, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { IChatSuggestion } from "@/Nenichat/ChatSuggestions/domain/IChatSuggestion";
import { cn } from "@/lib/utils";

interface ChatAiSuggestionsProps {
    lastMessages?: any[];
    onSuggestionClick: (suggestion: string) => void;
    disabled?: boolean;
    me?: IContact | null;
    suggestions?: IChatSuggestion[];
}

/**
 * AI response suggestions component that fetches and displays quick replies based on chat history.
 * 
 * @param {ChatAiSuggestionsProps} props - The component props.
 * @returns {JSX.Element | null} The rendered suggestions or null if none.
 */
export function ChatAiSuggestions({ lastMessages, onSuggestionClick, disabled, me, suggestions: initialSuggestions }: ChatAiSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<IChatSuggestion[]>(initialSuggestions || [])
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false);

    // Initialize state from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem("chat-ai-suggestions-expanded");
        if (stored !== null) {
            setIsExpanded(stored === "true");
        }
    }, []);

    const toggleExpanded = () => {
        const newState = !isExpanded;
        setIsExpanded(newState);
        localStorage.setItem("chat-ai-suggestions-expanded", String(newState));
    };

    // Sync internal suggestions with prop
    useEffect(() => {
        if (initialSuggestions) {
            setSuggestions(initialSuggestions);
        }
    }, [initialSuggestions]);

    /**
     * Fetches new suggestions from the API and updates the local state.
     */
    const handleReload = async () => {
        if (!lastMessages || lastMessages.length === 0 || isLoadingSuggestions) return;

        // Auto-expand if reloading manually
        if (!isExpanded) {
            toggleExpanded();
        }

        setIsLoadingSuggestions(true);
        try {
            const response = await fetch("/api/suggestions/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: lastMessages }),
            });

            if (!response.ok) throw new Error("Failed to fetch suggestions");

            const data = await response.json();
            const newSuggestions: IChatSuggestion[] = data.suggestions.map((s: string, index: number) => ({
                id: BigInt(Date.now() + index), // Temporary ID
                suggestion: s,
                chat_id: BigInt(0),
                message_id: "",
                is_selected: false,
                created_at: new Date(),
            }));

            setSuggestions(newSuggestions);
        } catch (error) {
            console.error("Error reloading suggestions:", error);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    // Fetch suggestions when lastMessages change, but only if the last message is from the customer
    useEffect(() => {
        const lastMessage = lastMessages?.[0];
        const isFromCustomer = lastMessage && (lastMessage.sender_jid !== me?.lid && lastMessage.sender_jid !== me?.phone_number);
        if (isFromCustomer) {
            // Logic to auto-fetch could go here if not provided by prop
        }
    }, [lastMessages, me?.id]);

    const hasMessages = lastMessages && lastMessages.length > 0;
    if (suggestions.length === 0 && !isLoadingSuggestions && !hasMessages) return null;

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
                        disabled={disabled || isLoadingSuggestions || !hasMessages}
                        title="Recargar sugerencias"
                    >
                        <RotateCw className={cn("w-3.5 h-3.5", isLoadingSuggestions && "animate-spin")} />
                        <span>
                            {isLoadingSuggestions ? "Analizando..." : "Analizar chat"}
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
                        <div className="flex flex-wrap gap-2 pb-2">
                            {isLoadingSuggestions ? (
                                <motion.div
                                    key="skeleton"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex gap-2"
                                >
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-9 w-24 bg-muted animate-pulse rounded-full" />
                                    ))}
                                </motion.div>
                            ) : (
                                suggestions?.map((suggestion, index) => (
                                    <motion.div
                                        key={suggestion.id.toString()}
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                onSuggestionClick(suggestion.suggestion);
                                                // setSuggestions([]); // Clear after selection
                                            }}
                                            className="cursor-pointer rounded-full bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/40 text-xs py-1.5 h-auto transition-all duration-300"
                                            disabled={disabled}
                                        >
                                            {suggestion.suggestion}
                                        </Button>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
