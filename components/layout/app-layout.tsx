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
        <SidebarProvider open={isOpen} onOpenChange={setIsOpen}>
            <AppSidebar />
            <div className="flex flex-col md:flex-row w-full">
                <SidebarInset className="justify-center w-full ">
                    {children}
                    <ToasterProvider />
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
