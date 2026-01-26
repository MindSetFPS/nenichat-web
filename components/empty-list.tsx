'use client';

/**
 * @function EmptyProducts
 * @description An attractive empty state component for when there are no products.
 * Displays a centered message with a create product button.
 */

interface EmptyListProps {
    title: string;
    description: string;
    action?: React.ReactNode;
    icon: React.ReactNode;
}

export function EmptyList({ action, description, title, icon }: EmptyListProps) {
    return (
        <div className="flex items-center justify-center w-full h-full">
            <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-md px-6">

                <div className="relative">
                    <div className="absolute animate-spin inset-0 bg-linear-to-r from-indigo-500/30 via-purple-500/50 to-pink-500/50 blur-3xl rounded-full animate-glow" />
                    <div className="relative bg-linear-to-br from-primary/10 to-primary/5 p-8 rounded-3xl border border-primary/20 shadow-lg">
                        {icon}
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {title}
                    </h2>
                    <p className="text-muted-foreground text-base leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="pt-2">
                    {action}
                </div>
            </div>
        </div>
    );
}
