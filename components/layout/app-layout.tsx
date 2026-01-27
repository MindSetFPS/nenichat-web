'use client'

import { useState, useEffect } from 'react'
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { useHeaderStore } from "@/stores/header-store"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ToasterProvider } from "@/components/toaster-provider"

interface AppLayoutProps {
    children: React.ReactNode
}

function DynamicHeaderContent() {
    const component = useHeaderStore((state) => state.component)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])
    if (!mounted) return null
    return <>{component}</>
}

export function AppLayout({ children }: AppLayoutProps) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <SidebarProvider open={isOpen} onOpenChange={setIsOpen}>
            <AppSidebar />
            <div className="flex flex-col md:flex-row w-full">
                <SidebarInset className="justify-center w-full md:h-[calc(100vh-1rem)]">
                    <div className="flex flex-col border-t border-b border-r box-border w-full h-dvh ">
                        <div className="flex w-full items-center my-2 px-2 ">
                            <SidebarTrigger className="size-auto mr-2" />
                            <div className="flex items-center w-full justify-between">
                                <DynamicHeaderContent />
                            </div>
                        </div>
                        <div className="p-2 overflow-auto h-full">
                            {children}
                        </div>
                    </div>
                    <ToasterProvider />
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
