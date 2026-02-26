'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title?: string
    children?: React.ReactNode
    className?: string
}

/**
 * PageHeader component displays a header with a toggle trigger, a title, and optional actions.
 * 
 * @param {PageHeaderProps} props - Component props
 * @param {string} props.title - The title to display in the header
 * @param {React.ReactNode} [props.children] - Optional actions or components to display on the right
 * @returns {JSX.Element} The rendered PageHeader component.
 */
export function PageHeader({ title, children, className }: PageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between h-8 w-full", className)}>
            <div className="flex items-center overflow-hidden">
                <SidebarTrigger className=" text-muted-foreground shrink-0 md:hidden" />
                {title && <h2 className="text-md font-bold tracking-wider text-muted-foreground truncate">{title}</h2>}
            </div>
            {children && (
                <div className="flex items-center gap-2 ml-4">
                    {children}
                </div>
            )}
        </div>
    )
}
