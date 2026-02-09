'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"

interface PageHeaderProps {
    title: string
    children?: React.ReactNode
}

/**
 * PageHeader component displays a header with a toggle trigger, a title, and optional actions.
 * 
 * @param {PageHeaderProps} props - Component props
 * @param {string} props.title - The title to display in the header
 * @param {React.ReactNode} [props.children] - Optional actions or components to display on the right
 * @returns {JSX.Element} The rendered PageHeader component.
 */
export function PageHeader({ title, children }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between h-8 w-full">
            <div className="flex items-center overflow-hidden">
                <SidebarTrigger className=" text-muted-foreground shrink-0 md:hidden" />
                <h2 className="text-md font-bold tracking-wider text-muted-foreground truncate">{title}</h2>
            </div>
            <div className="flex items-center gap-2 ml-4">
                {children}
            </div>
        </div>
    )
}
