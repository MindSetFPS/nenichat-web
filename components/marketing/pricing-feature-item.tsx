import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingFeatureItemProps {
    children: React.ReactNode;
    status?: "live" | "soon";
    icon?: LucideIcon;
    iconClassName?: string;
    className?: string;
}

export function PricingFeatureItem({
    children,
    status = "live",
    icon: Icon = Check,
    iconClassName,
    className,
}: PricingFeatureItemProps) {
    const isSoon = status === "soon";

    return (
        <li className={cn("flex items-start gap-3 text-sm", isSoon && "text-muted-foreground", className)}>
            <Icon
                className={cn(
                    "h-5 w-5 shrink-0",
                    iconClassName,
                    !iconClassName && (isSoon ? "text-muted-foreground" : "text-green-500")
                )}
            />
            <span>
                {children}
                {isSoon && <span className="text-xs text-muted-foreground"> (Próximamente)</span>}
            </span>
        </li>
    );
}
