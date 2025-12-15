'use client'

import { useEffect } from "react"
import { usePathname, useRouter } from 'next/navigation'
import { HomeIcon, UsersIcon, SendIcon, MailIcon, PackageIcon, ChevronDown, ShoppingBag, SettingsIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    useSidebar,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { getContactIdentifier } from '@/Nenichat/Contacts/app/get-contact-identifier'
import ContactAvatar from './contact-avatar'
import IContactWithLastMessage from '@/Nenichat/Contacts/app/dtos/IContactWithLastMessage'
import dateToHuman from '@/Nenichat/Shared/app/date-to-human'

interface AppSidebarProps {
    contacts: string
}

export function AppSidebar({ contacts: contactsJson }: AppSidebarProps) {
    const sidebar = useSidebar()
    const pathname = usePathname()
    const router = useRouter()
    const contacts: IContactWithLastMessage[] = JSON.parse(contactsJson)
    const isActive = (path: string) => {
        return pathname === path
    }

    const menuItems = [
        {
            id: 'home',
            href: '/home',
            icon: HomeIcon,
            label: 'Inicio'
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
            id: 'campaigns',
            href: '/campaigns',
            icon: SendIcon,
            label: 'Campañas'
        },
        {
            id: 'audiences',
            href: '/audiences',
            icon: MailIcon,
            label: 'Audiencias'
        },
        {
            id: 'contacts',
            icon: UsersIcon,
            label: 'Contactos',
            submenu: [
                {
                    id: 'contacts-list',
                    href: '/contacts',
                    label: 'Todos los contactos'
                },
                {
                    id: 'merge-contacts',
                    href: '/contacts/merge',
                    label: 'Unir contactos'
                }
            ]
        },


        {
            id: 'messages',
            href: '/messages',
            icon: MailIcon,
            label: 'Mensajes'
        },
        {
            id: 'settings',
            href: '/settings',
            icon: SettingsIcon,
            label: 'Ajustes'
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
                {/* <p>Nenichat</p> */}
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {menuItems.map((item) => {
                            const Icon = item.icon

                            // If item has submenu, render collapsible
                            if (item.submenu && item.submenu.length > 0) {
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
                                                    {item.submenu.map((subItem) => (
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
                                        className='cursor-pointer'
                                        isActive={isActive(item.href!)}
                                        onClick={() => changeRoute(item.href!)}>
                                        <Icon className='w-5! h-5! md:h-4! md:w-4!' />
                                        <span className='text-lg md:text-sm'>
                                            {item.label}
                                        </span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Contacts</SidebarGroupLabel>
                    <SidebarMenu>
                        {contacts.map((contact: IContactWithLastMessage) => (
                            <SidebarMenuItem key={contact.id} >
                                <SidebarMenuButton
                                    className="py-2 h-16 w-full truncate overflow-hidden whitespace-nowrap cursor-pointer"
                                    size={'lg'}
                                    isActive={isActive(`/chats/${contact.id}`)}
                                    onClick={() => changeRoute(`/chats/${contact.id}`)}>
                                    <div className="flex w-full items-center gap-2">
                                        <Avatar className="h-full">
                                            <ContactAvatar seed={getContactIdentifier(contact!)!} />
                                            <AvatarFallback>
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col py-2 text-left">
                                            <span className="font-semibold">
                                                {contact.contact_name || contact.pushname || contact.phone_number || contact.lid}
                                            </span>
                                            <span className="text-sm text-muted-foreground text-ellipsis">
                                                {contact.last_message?.text_content}
                                            </span>
                                            <span className="text-xs text-muted-foreground w-auto">
                                                {(() => {
                                                    const createdAt = contact.last_message?.created_at;
                                                    return dateToHuman(String(createdAt));
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            {/* <SidebarFooter>
                <p>Footer</p>
                <ModeToggle />
            </SidebarFooter> */}
        </Sidebar>
    )
}