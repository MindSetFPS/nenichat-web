import { ThemeProvider } from "@/components/theme-provider"
import "@/styles/globals.css"
import { AppLayout } from "@/components/layout/app-layout"
import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository"
import IContactWithLastMessage from "@/Nenichat/Contacts/app/dtos/IContactWithLastMessage"

import { requireAuth } from "@/lib/auth"

interface RootLayoutProps {
    children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
    await requireAuth()
    let contactsWithLastMessage: IContactWithLastMessage[] = [];
    try {
        contactsWithLastMessage = await contactRepository.getContactsWithLastMessage(0, 1000);
    } catch (error) {
        console.warn("Failed to fetch contacts in RootLayout (possibly during build):", error);
    }
    const contactsWithLastMessageJSON = JSON.stringify(contactsWithLastMessage)

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
                        <AppLayout contactsJson={contactsWithLastMessageJSON}>
                            {children}
                        </AppLayout>
                    </ThemeProvider>
                </body>
            </html>
        </>
    )
}