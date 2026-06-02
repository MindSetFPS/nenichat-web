"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { SuggestionAction } from "@/Nenichat/Suggestions/domain/ISuggestionAction"
import { useTokenUsageStore } from "@/stores/token-usage-store"

interface UseSuggestionFetcherOptions {
    lastMessages?: any[]
    initialSuggestions?: SuggestionAction[]
    textSuggestionCount?: number
    orderSuggestionCount?: number
}

interface UseSuggestionFetcherReturn {
    suggestions: SuggestionAction[]
    pendingCount: number
    isReloading: boolean
    tokenStats: { promptTokens: number; completionTokens: number } | null
    reload: () => void
}

export function useSuggestionFetcher({
    lastMessages,
    initialSuggestions,
    textSuggestionCount = 2,
    orderSuggestionCount = 2,
}: UseSuggestionFetcherOptions): UseSuggestionFetcherReturn {
    const addUsage = useTokenUsageStore((s) => s.addUsage)
    const [suggestions, setSuggestions] = useState<SuggestionAction[]>(initialSuggestions || [])
    const [isReloading, setIsReloading] = useState(false)
    const [pendingCount, setPendingCount] = useState(0)
    const [tokenStats, setTokenStats] = useState<{ promptTokens: number; completionTokens: number } | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    useEffect(() => {
        if (initialSuggestions) {
            setSuggestions(initialSuggestions)
        }
    }, [initialSuggestions])

    useEffect(() => {
        return () => abortRef.current?.abort()
    }, [])

    const reload = useCallback(() => {
        if (!lastMessages || lastMessages.length === 0 || isReloading) return

        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setIsReloading(true)
        setSuggestions([])
        setTokenStats(null)

        const total = textSuggestionCount + orderSuggestionCount
        setPendingCount(total)

        let tokenAccum = { promptTokens: 0, completionTokens: 0 }

        const onResponse = (data: { suggestion?: SuggestionAction | null; promptTokens?: number; completionTokens?: number }) => {
            const pt = data.promptTokens ?? 0
            const ct = data.completionTokens ?? 0
            tokenAccum.promptTokens += pt
            tokenAccum.completionTokens += ct
            setTokenStats({ ...tokenAccum })
            if (pt > 0 || ct > 0) {
                addUsage(pt, ct)
            }
            if (data.suggestion) {
                setSuggestions(prev => [...prev, data.suggestion!])
            }
        }

        const onFinally = () => {
            setPendingCount(prev => {
                const next = prev - 1
                if (next <= 0) setIsReloading(false)
                return next
            })
        }

        for (let i = 0; i < textSuggestionCount; i++) {
            fetch("/api/suggestions/generate-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: lastMessages }),
                signal: controller.signal,
            })
                .then(res => res.json())
                .then(onResponse)
                .catch(err => { if (err.name !== 'AbortError') console.error("Error:", err) })
                .finally(onFinally)
        }

        for (let i = 0; i < orderSuggestionCount; i++) {
            fetch("/api/suggestions/generate-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: lastMessages }),
                signal: controller.signal,
            })
                .then(res => res.json())
                .then(onResponse)
                .catch(err => { if (err.name !== 'AbortError') console.error("Error:", err) })
                .finally(onFinally)
        }
    }, [lastMessages, isReloading, textSuggestionCount, orderSuggestionCount])

    return { suggestions, pendingCount, isReloading, tokenStats, reload }
}
