'use client'

import { useEffect } from "react"
import { usePathname, useRouter } from 'next/navigation'
import { HomeIcon, UsersIcon, MailIcon, PackageIcon, ChevronDown, ShoppingBag, Truck, Receipt, TrendingUp, Menu, FileText, SendIcon, Motorbike, Brain } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,

    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarFooter,
    useSidebar,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

import { Badge } from "../ui/badge"
import { NavUser } from "./nav-user"
import { Logo } from "../logo"
import { SettingsDialog } from "../settings-dialog"

type MenuItemState = 'visible' | 'soon' | 'hidden'

type MenuSubItem = {
    id: string
    href: string
    label: string
    state?: MenuItemState
}

type MenuItem = {
    id: string
    href?: string
    icon: LucideIcon
    label: string
    state?: MenuItemState
    submenu?: MenuSubItem[]
}

export function AppSidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const sidebar = useSidebar()
    const { toggleSidebar, isMobile } = useSidebar()

    const isActive = (path: string) => {
        return pathname === path
    }

    const menuItems: MenuItem[] = [
        {
            id: 'home',
            href: '/home',
            icon: HomeIcon,
            label: 'Inicio'
        },
        {
            id: 'chats',
            href: '/chats',
            icon: MailIcon,
            label: 'Chats'
        },
        {
            id: 'sales',
            href: '/orders',
            icon: ShoppingBag,
            label: 'Ventas'
        },
        {
            id: 'products',
            href: '/products',
            icon: PackageIcon,
            label: 'Productos'
        },
        {
            id: 'expenses',
            href: '/expenses',
            icon: Receipt,
            label: 'Gastos',
        },
        {
            id: 'profitability',
            href: '/profitability',
            icon: TrendingUp,
            label: 'Rentabilidad'
        },
        {
            id: 'templates',
            href: '/templates',
            icon: FileText,
            label: 'Plantillas',
        },
        {
            id: 'campaigns',
            href: '/campaigns',
            icon: SendIcon,
            label: 'Campañas',
        },
        {
            id: 'audiences',
            href: '/audiences',
            icon: MailIcon,
            label: 'Audiencias',
        },
        {
            id: 'bi',
            href: '/bi',
            icon: Brain,
            label: 'Analisis Interactivo',
            state: 'soon'
        },
        {
            id: 'delivery',
            href: '/delivery',
            icon: Motorbike,
            label: 'Entrega',
            state: 'soon'
        },
        {
            id: 'shipments',
            href: '/shipments',
            icon: Truck,
            label: 'Envíos',
            state: 'soon'
        },
        {
            id: 'contacts',
            icon: UsersIcon,
            label: 'Contactos',
            submenu: [
                {
                    id: 'contacts-list',
                    href: '/contacts',
                    label: 'Ver todos'
                },
                {
                    id: 'merge-contacts',
                    href: '/contacts/merge',
                    label: 'Unir contactos'
                }
            ]
        }
    ]

    function changeRoute(route: string) {
        router.push(route)
    }

    useEffect(() => {
        sidebar.setOpenMobile(false)
    }, [pathname]);


    return (
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader>
                <SidebarMenuItem className="hidden md:block">
                    <SidebarMenuButton onClick={toggleSidebar} >
                        {isMobile ? <Menu className="size-5" /> : <Logo className="size-5" />}
                        <span className="font-bold text-xl md:text-sm">Nenichat</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {menuItems.filter((item) => item.state !== 'hidden').map((item) => {
                            const Icon = item.icon
                            const isSoon = item.state === 'soon'
                            const submenu = item.submenu?.filter((subItem) => subItem.state !== 'hidden') ?? []
                            // If item has submenu, render collapsible
                            if (submenu.length > 0) {
                                return (
                                    <Collapsible key={item.id} defaultOpen className="group/collapsible">
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton>
                                                    <Icon className="w-5! h-5! md:w-4! md:h-4!" />
                                                    <span className="text-lg md:text-sm">{item.label}</span>
                                                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {submenu.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.id}>
                                                            <SidebarMenuSubButton
                                                                className='cursor-pointer'
                                                                isActive={isActive(subItem.href)}
                                                                onClick={() => changeRoute(subItem.href)}>
                                                                <span>{subItem.label}</span>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                )
                            }
                            // Regular menu item without submenu
                            return (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        disabled={isSoon}
                                        className='cursor-pointer'
                                        isActive={isActive(item.href!)}
                                        onClick={() => changeRoute(item.href!)}>
                                        <Icon className='w-5! h-5! md:h-4! md:w-4!' />
                                        <span className='min-w-0 flex-1 truncate text-lg md:text-sm'>{item.label}</span>
                                        {isSoon && (
                                            <Badge className='shrink-0 text-xs group-data-[collapsible=icon]:hidden'>
                                                Pronto
                                            </Badge>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SettingsDialog />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}