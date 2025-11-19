import { ThemeProvider } from "@/components/theme-provider"
import "../styles/globals.css"
import { AppSidebar } from "../components/app-sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { contactRepository } from "@/repository/ContactRepository"
import { ToasterProvider } from "@/components/toaster-provider" // Import ToasterProvider

interface RootLayoutProps {
    children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
    let contacts: any[] = [];
    try {
        contacts = await contactRepository.list(0, 10);
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
                            <SidebarTrigger />
                            <SidebarInset>
                                <div className="flex flex-col box-border h-full w-full md:w-4xl my-2
                                bg-background mx-auto border rounded-r-lg md:rounded-lg overflow-hidden">
                                    {children}
                                </div>
                                <ToasterProvider /> {/* Use ToasterProvider here */}
                            </SidebarInset>
                        </SidebarProvider>
                    </ThemeProvider>
                </body>
            </html>
        </>
    )
}