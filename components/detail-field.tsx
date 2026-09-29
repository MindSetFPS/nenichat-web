import type { ReactNode } from "react";

/**
 * A label/value row for use inside a <dl>, matching the detail cards
 * on the order and contact pages.
 */
export function DetailField({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="text-sm">{children}</dd>
        </div>
    );
}
