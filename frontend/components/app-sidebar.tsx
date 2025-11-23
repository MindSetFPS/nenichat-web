'use client'
import Link from 'next/link'
import { HomeIcon, UsersIcon, SendIcon, MailIcon, PackageIcon, UserIcon, ChevronDown, ShoppingBag } from 'lucide-react'
import { avataaars } from '@dicebear/collection'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createAvatar } from '@dicebear/core'
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { IContact } from '@/Nenichat/Contacts/domain/IContact'
import { ModeToggle } from './mode-toggle'
import { getContactIdentifier } from '@/Nenichat/Contacts/app/get-contact-identifier'
import ContactAvatar from './contact-avatar'

interface AppSidebarProps {
    contacts: string
}


export function AppSidebar({ contacts: contactsJson }: AppSidebarProps) {
    const pathname = usePathname()
    const contacts: IContact[] = JSON.parse(contactsJson)
    const isActive = (path: string) => {
        return pathname === path
    }

    const menuItems = [
        {
            id: 'home',
            href: '/',
            icon: HomeIcon,
            label: 'Home'
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
            label: 'Contacts',
            submenu: [
                {
                    id: 'contacts-list',
                    href: '/contacts',
                    label: 'All Contacts'
                },
                {
                    id: 'merge-contacts',
                    href: '/contacts/merge',
                    label: 'Merge Contacts'
                }
            ]
        },
        {
            id: 'products',
            href: '/products',
            icon: PackageIcon,
            label: 'Products'
        },
        {
            id: 'sales',
            href: '/orders',
            icon: ShoppingBag,
            label: 'Orders'
        },
        {
            id: 'messages',
            href: '/messages',
            icon: MailIcon,
            label: 'Messages'
        },
        {
            id: 'profile',
            href: '/profile',
            icon: UserIcon,
            label: 'My Profile'
        }
    ]

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
                                                    <Icon className="w-4 h-4" />
                                                    <span>{item.label}</span>
                                                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.submenu.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.id}>
                                                            <SidebarMenuSubButton asChild isActive={isActive(subItem.href)}>
                                                                <Link href={subItem.href} passHref>
                                                                    <span>{subItem.label}</span>
                                                                </Link>
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
                                    <SidebarMenuButton asChild isActive={isActive(item.href!)}>
                                        <Link href={item.href!} passHref>
                                            <Icon className="w-4 h-4" />
                                            <span>
                                                {item.label}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Contacts</SidebarGroupLabel>
                    <SidebarMenu>
                        {contacts.map((contact: IContact) => (
                            <SidebarMenuItem key={contact.id}>
                                <SidebarMenuButton asChild isActive={isActive(`/chats/${contact.id}`)}>
                                    <Link href={`/chats/${contact.id}`} passHref>
                                        <Avatar className="h-full w-auto">
                                            <ContactAvatar seed={getContactIdentifier(contact!)!} />

                                            <AvatarFallback>
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>
                                            {contact.contact_name || contact.pushname || contact.phone_number || contact.lid}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <p>Footer</p>
                <ModeToggle />
            </SidebarFooter>
        </Sidebar>
    )
}