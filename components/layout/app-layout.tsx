'use client'

import { useState } from 'react'
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ToasterProvider } from "@/components/toaster-provider"

interface AppLayoutProps {
    children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <SidebarProvider
            open={isOpen}
            onOpenChange={setIsOpen}
            className="h-svh overflow-hidden"
            style={{
                "--sidebar-width": "12rem",
            } as React.CSSProperties}
        >
            <AppSidebar />
            <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
                <SidebarInset className="justify-center flex-1 overflow-hidden flex flex-col md:pr-2">
                    {children}
                    <ToasterProvider />
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
