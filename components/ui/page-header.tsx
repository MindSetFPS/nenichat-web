'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title?: string
    children?: React.ReactNode
    className?: string
    leftContent?: React.ReactNode
}

/**
 * PageHeader component displays a header with a toggle trigger, a title, and optional actions.
 */
export function PageHeader({ title, children, className, leftContent }: PageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between w-full", title || leftContent || children ? "h-8" : "", className)}>
            <div className="flex items-center overflow-hidden gap-2">
                {leftContent ? (
                    leftContent
                ) : (
                    <SidebarTrigger className="text-muted-foreground shrink-0 md:hidden" />
                )}
                {title && <h2 className="text-md font-bold tracking-wider text-muted-foreground truncate">{title}</h2>}
            </div>
            {children && (
                <div className="flex items-center gap-1 md:gap-2">
                    {children}
                </div>
            )}
        </div>
    )
}

