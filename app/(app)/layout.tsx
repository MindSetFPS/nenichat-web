import { ThemeProvider } from "@/components/theme-provider"
import "@/styles/globals.css"
import { AppLayout } from "@/components/layout/app-layout"
import { requireAuth } from "@/lib/auth"
import { ContactInitializer } from "@/components/contact-initializer"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getBusinessFromUser } from "@/lib/user-auth"
import { GoWappChatRepository } from "@/Nenichat/Chats/infra/api"
import { getJidKind } from "@/Nenichat/Chats/domain/Jid"
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository"
import { IContact } from "@/Nenichat/Contacts/domain/IContact"

interface RootLayoutProps {
    children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
    await requireAuth()

    let contactsData: IContact[] = []

    try {
        const supabase = await createServerSupabaseClient()
        const { business, error: authError } = await getBusinessFromUser(supabase)

        if (authError || !business) {
            console.error('Error getting business:', authError)
        } else {
            // Get WhatsApp credentials and fetch chats
            const wappUrl = "http://192.168.1.64/api/user/" + business.id
            const wappChatRepository = new GoWappChatRepository(wappUrl, "admin", "admin")
            const chats = await wappChatRepository.list(0, 100)

            // Extract jids for contacts lookup
            const lookups: { value: string; is_lid: boolean }[] = []
            for (const chat of chats) {
                const jidKind = getJidKind(chat.jid)
                if (jidKind !== 'group' && jidKind !== 'unknown') {
                    lookups.push({ value: chat.jid, is_lid: jidKind === 'lid' })
                }
            }

            // Batch fetch contacts
            if (lookups.length > 0) {
                const contactRepository = new SupabaseContactRepository(supabase)
                contactsData = await contactRepository.findBatchByPhoneOrLid(business.id, lookups)
            }
        }
    } catch (error) {
        console.error('Error fetching contacts in root layout:', error)
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
                        <ContactInitializer contacts={JSON.parse(JSON.stringify(contactsData))}>
                            <AppLayout>
                                {children}
                            </AppLayout>
                        </ContactInitializer>
                    </ThemeProvider>
                </body>
            </html>
        </>
    )
}
