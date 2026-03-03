"use client"

import * as React from "react"
import {
    MessageCircle,
    Paintbrush,
    Settings,
    User,
    Building2,
    EyeOff,
    CreditCard,
    ChevronLeft,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

import { AccountSettings } from "./settings/account-settings"
import { BusinessSettings } from "./settings/business-settings"
import { WhatsAppSettings } from "./settings/whatsapp-settings"
import { HiddenContactsSettings } from "./settings/hidden-contacts-settings"
import { SubscriptionSettings } from "./settings/subscription-settings"
import { ModeToggle } from "./mode-toggle"

const sections = [
    {
        id: 'account',
        title: "Cuenta",
        icon: User,
        component: AccountSettings
    },
    {
        id: 'business',
        title: "Negocio",
        icon: Building2,
        component: BusinessSettings
    },
    {
        id: 'connections',
        title: "WhatsApp",
        icon: MessageCircle,
        component: WhatsAppSettings
    },
    {
        id: 'privacy',
        title: "Privacidad",
        icon: EyeOff,
        component: HiddenContactsSettings
    },
    {
        id: 'billing',
        title: "Suscripciones",
        icon: CreditCard,
        component: SubscriptionSettings
    },
    {
        id: 'appearance',
        title: "Apariencia",
        icon: Paintbrush,
        component: null // Special case for ModeToggle
    }
]

export function SettingsDialog() {
    const [open, setOpen] = React.useState(false)
    const [activeSection, setActiveSection] = React.useState<string | null>(sections[0].id)
    const searchParams = useSearchParams()
    const router = useRouter()

    React.useEffect(() => {
        const settings = searchParams.get('settings')
        const section = searchParams.get('section')

        if (settings === 'true') {
            setOpen(true)
            if (section && sections.some(s => s.id === section)) {
                setActiveSection(section)
            }
        } else {
            setOpen(false)
        }
    }, [searchParams])

    const ActiveComponent = sections.find(s => s.id === activeSection)?.component

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <SidebarMenuButton>
                    <Settings className="size-5" />
                    <span>Ajustes</span>
                </SidebarMenuButton>
            </DialogTrigger>
            <DialogContent className="overflow-hidden p-0 h-[90dvh] max-w-[95vw] md:max-w-[750px] lg:max-w-[900px] rounded-3xl">
                <DialogTitle className="sr-only">Settings</DialogTitle>
                <DialogDescription className="sr-only">
                    Customize your settings here.
                </DialogDescription>
                <SidebarProvider className="items-start" style={{ minHeight: 0, height: '100%' }}>
                    <Sidebar
                        collapsible="none"
                        className={cn(
                            "hidden md:flex w-[200px] border-r h-full",
                            activeSection === null && "flex w-full"
                        )}
                    >
                        <SidebarContent>
                            <SidebarGroup>
                                <SidebarGroupContent>
                                    <SidebarMenu className="gap-1 p-2">
                                        {sections.map((item) => (
                                            <SidebarMenuItem key={item.id}>
                                                <SidebarMenuButton
                                                    onClick={() => setActiveSection(item.id)}
                                                    isActive={activeSection === item.id}
                                                    className="rounded-xl px-3 py-5"
                                                >
                                                    <item.icon className="size-5" />
                                                    <span className="font-bold text-sm tracking-tight">{item.title}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>
                    <main className={cn(
                        "flex h-full flex-1 min-w-0 flex-col overflow-hidden bg-background",
                        activeSection === null && "hidden md:flex"
                    )}>
                        <header className="flex h-14 shrink-0 items-center gap-2 px-4 md:px-6 border-b">
                            {activeSection !== null && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden -ml-4 mr-2"
                                    onClick={() => setActiveSection(null)}
                                >
                                    <ChevronLeft className="size-5" />
                                </Button>
                            )}
                            <h2 className=" tracking-tight ">
                                {sections.find(s => s.id === activeSection)?.title || "Ajustes"}
                            </h2>
                        </header>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 scrollbar-none">
                            {activeSection === 'appearance' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-sm">Tema del sistema</h3>
                                            <p className="text-xs text-muted-foreground">Cambia entre modo claro y oscuro</p>
                                        </div>
                                        <ModeToggle />
                                    </div>
                                </div>
                            ) : (
                                ActiveComponent && <ActiveComponent />
                            )}
                        </div>
                    </main>
                </SidebarProvider>
            </DialogContent>
        </Dialog>
    )
}
