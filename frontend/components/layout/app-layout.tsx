'use client'

import { useState } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ToasterProvider } from "@/components/toaster-provider"

interface AppLayoutProps {
    children: React.ReactNode
    contactsJson: string
}

export function AppLayout({ children, contactsJson }: AppLayoutProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <SidebarProvider open={isOpen} onOpenChange={setIsOpen}>
            <AppSidebar contacts={contactsJson} />
            <div className="flex flex-col md:flex-row w-full">
                <SidebarInset className="justify-center">
                    <div className="flex flex-col box-border 
                    w-full h-dvh md:h-[calc(100vh-1rem)] md:w-4xl 
                    my-0 py-0 md:my-2 md:py-2 mx-auto p-2 md:p-4 space-y-4
                    bg-background 
                    md:border rounded-r-lg md:rounded-lg overflow-hidden">
                        {children}
                    </div>
                    <ToasterProvider />
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
