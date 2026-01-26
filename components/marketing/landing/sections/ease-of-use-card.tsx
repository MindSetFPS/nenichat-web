import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EaseOfUseCardProps {
    icon: LucideIcon
    title: string
    description: string
    iconWrapperClassName?: string
    children: ReactNode
}

/**
 * A card component for the Ease of Use section, displaying a feature with an icon, title, description, and a visual preview.
 */
export function EaseOfUseCard({
    icon: Icon,
    title,
    description,
    iconWrapperClassName,
    children
}: EaseOfUseCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-3xl border bg-muted/20 hover:bg-muted/30 transition-colors duration-300 p-4 flex flex-col h-full">
            <div className="mb-6">
                <div className={cn("p-3 rounded-2xl w-fit mb-4", iconWrapperClassName)}>
                    <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground">
                    {description}
                </p>
            </div>
            <div className="mt-auto relative w-full aspect-video rounded-xl overflow-hidden bg-background border shadow-sm">
                {children}
            </div>
        </div>
    )
}
