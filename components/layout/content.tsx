export default function Content({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div
        className={`h-full md:h-[calc(100vh-1rem)] md:my-2 max-w-6xl mx-auto w-full md:border md:rounded-lg overflow-hidden md:bg-muted/5 ${className}`}>
        {children}
    </div>
}