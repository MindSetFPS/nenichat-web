"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"

interface LightboxProps {
    src: string
    alt: string
    caption?: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function Lightbox({ src, alt, caption, open, onOpenChange }: LightboxProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton
                className="border-none bg-muted/0 w-min shadow-none p-0 max-h-[90vh] sm:max-w-[90vw]"
            >
                <img
                    src={src}
                    alt={alt}
                    className="max-w-[85vw] max-h-[80vh] object-contain rounded-lg mx-auto"
                />
                {caption && (
                    <p className="text-white text-sm text-center max-w-[85vw] wrap-break-word pb-2">
                        {caption}
                    </p>
                )}
            </DialogContent>
        </Dialog>
    )
}
