import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import ContactAvatar from "@/components/contact-avatar";
import { cn } from "@/lib/utils";

export interface ProfileSummaryStat {
    label: string;
    value: string;
    className?: string;
}

interface ProfileSummaryCardProps {
    avatarSeed?: string;
    initials: string;
    title: string;
    titleClassName?: string;
    badge?: ReactNode;
    meta?: ReactNode;
    actions?: ReactNode;
    stats: ProfileSummaryStat[];
}

export function ProfileSummaryCard({
    avatarSeed,
    initials,
    title,
    titleClassName,
    badge,
    meta,
    actions,
    stats,
}: ProfileSummaryCardProps) {
    return (
        <Card className="gap-0 overflow-hidden py-0">
            <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-12">
                        {avatarSeed ? <ContactAvatar seed={avatarSeed} /> : null}
                        <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 space-y-1">
                        <div className="flex min-w-0 items-center gap-2">
                            <span className={cn("truncate text-lg font-semibold leading-tight", titleClassName)}>
                                {title}
                            </span>
                            {badge}
                        </div>
                        {meta && (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                                {meta}
                            </div>
                        )}
                    </div>
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
            <dl className="grid grid-cols-2 md:grid-cols-4">
                {stats.map((stat, index) => (
                    <div
                        key={stat.label}
                        className={cn(
                            "border-border p-4",
                            index < 2 && "border-b md:border-b-0",
                            index % 2 === 0 && "border-r md:border-r-0",
                            index > 0 && "md:border-l"
                        )}
                    >
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {stat.label}
                        </dt>
                        <dd className={cn("mt-1 text-lg font-semibold tabular-nums", stat.className)}>
                            {stat.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </Card>
    );
}
