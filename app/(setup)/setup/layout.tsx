import { redirect } from "next/navigation"
import "@/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { requireAuth } from "@/lib/auth"

interface SetupLayoutProps {
    children: React.ReactNode
}

export default async function SetupLayout({ children }: SetupLayoutProps) {
    await requireAuth()

    return (
        <>
            <html lang="en" suppressHydrationWarning>
                <head />
                <body>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <div className="flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-primary/10 dark:via-background dark:to-background p-4">
                            {children}
                        </div>
                    </ThemeProvider>
                </body>
            </html>
        </>
    )
}
