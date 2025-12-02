import { ThemeProvider } from "@/components/theme-provider"
import "@/styles/globals.css"
import { AppSidebar } from "../../components/app-sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository"
import { ToasterProvider } from "@/components/toaster-provider"
import IContactWithLastMessage from "@/Nenichat/Contacts/app/dtos/IContactWithLastMessage"

interface RootLayoutProps {
    children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
    let contacts: IContactWithLastMessage[] = [];
    try {
        contacts = await contactRepository.getContactsWithLastMessage(0, 20);
    } catch (error) {
        console.warn("Failed to fetch contacts in RootLayout (possibly during build):", error);
    }
    const contactsJson = JSON.stringify(contacts)

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
                        <SidebarProvider>
                            <AppSidebar contacts={contactsJson} />
                            <div className="flex flex-col md:flex-row w-full">
                                <SidebarInset className="justify-center">
                                    <div className="flex flex-col box-border w-full h-[calc(100vh-1rem)]
                                                    md:w-4xl md:my-2 bg-background mx-auto p-2 md:p-4 space-y-4
                                                    md:border rounded-r-lg md:rounded-lg overflow-hidden">
                                        {children}
                                    </div>
                                    <ToasterProvider />
                                </SidebarInset>
                            </div>
                        </SidebarProvider>
                    </ThemeProvider>
                </body>
            </html>
        </>
    )
}