"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { ImageOff } from "lucide-react"

const mediaCache = new Map<string, string>()

interface MessageImageProps {
    messageId: string
    chatJid: string
    alt: string
    onLoaded?: (url: string) => void
    onClick?: () => void
}

export default function MessageImage({ messageId, chatJid, alt, onLoaded, onClick }: MessageImageProps) {
    const [src, setSrc] = useState<string | null>(() => mediaCache.get(messageId) ?? null)
    const [failed, setFailed] = useState(false)
    const [loading, setLoading] = useState(() => !mediaCache.has(messageId))
    const onLoadedRef = useRef(onLoaded)
    onLoadedRef.current = onLoaded

    useEffect(() => {
        const cached = mediaCache.get(messageId)
        if (cached) {
            setSrc(cached)
            setLoading(false)
            onLoadedRef.current?.(cached)
            return
        }

        let cancelled = false

        async function fetchMedia() {
            try {
                const response = await fetch(
                    `/api/messages/${encodeURIComponent(messageId)}/media?phone=${encodeURIComponent(chatJid)}`
                )

                if (!response.ok) {
                    throw new Error("Failed to download media")
                }

                const data = await response.json()

                if (!cancelled) {
                    mediaCache.set(messageId, data.file_url)
                    setSrc(data.file_url)
                    onLoadedRef.current?.(data.file_url)
                }
            } catch {
                if (!cancelled) {
                    setFailed(true)
                    setLoading(false)
                }
            }
        }

        fetchMedia()

        return () => {
            cancelled = true
        }
    }, [messageId, chatJid])

    if (failed || !src) {
        return (
            <div
                className="w-48 h-48 flex items-center justify-center bg-muted rounded-lg"
                onClick={onClick}
            >
                <ImageOff className="w-8 h-8 text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="relative w-60 h-60">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg animate-pulse" />
            )}
            <img
                src={src}
                alt={alt}
                className={cn(
                    "w-full h-full rounded object-cover cursor-pointer hover:opacity-90 transition-opacity",
                    loading && "opacity-0"
                )}
                onClick={onClick}
                onLoad={() => setLoading(false)}
                onError={() => {
                    setLoading(false)
                    setFailed(true)
                }}
            />
        </div>
    )
}
