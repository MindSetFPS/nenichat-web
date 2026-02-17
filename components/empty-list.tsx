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
                    {/* Animated background circles */}
                    <div className="absolute inset-0 animate-glow blur-3xl opacity-50 pointer-events-none z-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-cyan-400/40   rounded-full animate-[spin_25s_linear_infinite]         origin-[60%_60%] mix-blend-multiply dark:mix-blend-screen" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-rose-400/40   rounded-full animate-[spin_30s_linear_infinite_reverse] origin-[40%_40%] mix-blend-multiply dark:mix-blend-screen" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-purple-400/40 rounded-full animate-[spin_45s_linear_infinite]         origin-[30%_70%] mix-blend-multiply dark:mix-blend-screen" />
                    </div>

                    <div className="relative z-10 bg-linear-to-br from-primary/10 to-primary/5 p-8 rounded-3xl border border-primary/20 shadow-lg backdrop-blur-sm">
                        {icon}
                    </div>
                </div>

                <div className="relative z-10 space-y-3">
                    <h2 className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {title}
                    </h2>
                    <p className="text-muted-foreground text-base leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="relative z-10 pt-2">
                    {action}
                </div>
            </div>
        </div>
    );
}
