"use client"

import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ChatAiSuggestionsProps {
    lastMessages?: any[];
    onSuggestionClick: (suggestion: string) => void;
    disabled?: boolean;
}

/**
 * AI response suggestions component that fetches and displays quick replies based on chat history.
 * 
 * @param {ChatAiSuggestionsProps} props - The component props.
 * @returns {JSX.Element | null} The rendered suggestions or null if none.
 */
export function ChatAiSuggestions({ lastMessages, onSuggestionClick, disabled }: ChatAiSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

    // Fetch suggestions when lastMessages change
    useEffect(() => {
        if (lastMessages && lastMessages.length > 0) {
            fetchSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [lastMessages]);

    /**
     * Fetches AI response suggestions from the backend.
     */
    const fetchSuggestions = async () => {
        setIsLoadingSuggestions(true);
        try {
            const response = await fetch('/api/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: lastMessages }),
                signal: AbortSignal.timeout(90000), // 1.5 minute timeout
            });
            const data = await response.json();
            if (data.suggestions) {
                setSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    if (suggestions.length === 0 && !isLoadingSuggestions) return null;

    return (
        <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 px-1">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Respuestas rápidas</span>
            </div>
            <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout">
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
                        suggestions.map((suggestion, index) => (
                            <motion.div
                                key={suggestion}
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        onSuggestionClick(suggestion);
                                        setSuggestions([]); // Clear after selection
                                    }}
                                    className="cursor-pointer rounded-full bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/40 text-xs py-1.5 h-auto transition-all duration-300"
                                    disabled={disabled}
                                >
                                    {suggestion}
                                </Button>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
