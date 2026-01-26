'use client'

import { useState, useEffect } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { useHeaderStore } from "@/stores/header-store"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ToasterProvider } from "@/components/toaster-provider"
import { Separator } from '../ui/separator'

interface AppLayoutProps {
    children: React.ReactNode
    contactsJson: string
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

export function AppLayout({ children, contactsJson }: AppLayoutProps) {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <SidebarProvider open={isOpen} onOpenChange={setIsOpen}>
            <AppSidebar contacts={contactsJson} />
            <div className="flex flex-col md:flex-row w-full
            ">
                <SidebarInset className="justify-center">
                    {/* add a very subtle backgroun gradient */}
                    <div className="flex flex-col box-border 
                    w-full h-dvh md:h-[calc(100vh-1rem)] md:w-4xl 
                    my-0 py-0 md:my-2 mx-auto space-y-4
                    bg-background 
                    md:border rounded-r-lg md:rounded-lg overflow-hidden    
                    bg-linear-to-br dark:from-neutral-800/50 dark:to-neutral-950/50
                    ">
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
