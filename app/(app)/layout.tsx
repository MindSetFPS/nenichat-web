import { redirect } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import "@/styles/globals.css"
import { AppLayout } from "@/components/layout/app-layout"
import { requireAuth } from "@/lib/auth"
import { ContactInitializer } from "@/components/contact-initializer"
import { ChatInitializer } from "@/components/chat-initializer"
import { BusinessProvider } from "@/components/providers/business-context"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getBusinessFromUser } from "@/lib/user-auth"
import { Business } from "@/stores/business-store"

interface RootLayoutProps {
    children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
    await requireAuth()

    let business: Business | null = null

    try {
        const supabase = await createServerSupabaseClient()
        const { business: fetchedBusiness, error: authError } = await getBusinessFromUser(supabase)
        business = fetchedBusiness

        if (authError || !business) {
            redirect('/home')
        }
    } catch (error) {
        console.error('Error in root layout:', error)
    }

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
                        <BusinessProvider business={business}>
                            <ChatInitializer>
                                <ContactInitializer>
                                    <AppLayout>
                                        {children}
                                    </AppLayout>
                                </ContactInitializer>
                            </ChatInitializer>
                        </BusinessProvider>
                    </ThemeProvider>
                </body>
            </html>
        </>
    )
}
