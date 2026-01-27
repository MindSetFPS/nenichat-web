import { ThemeProvider } from "@/components/theme-provider"
import "@/styles/globals.css"
import { AppLayout } from "@/components/layout/app-layout"
import { requireAuth } from "@/lib/auth"

interface RootLayoutProps {
    children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
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
                        <AppLayout>
                            {children}
                        </AppLayout>
                    </ThemeProvider>
                </body>
            </html>
        </>
    )
}