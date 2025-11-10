'use client'

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
} from '@/components/ui/sidebar'
import { HomeIcon, UsersIcon, SendIcon, MailIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { IContact } from '@/repository/IContact'
import { ModeToggle } from './mode-toggle'

interface AppSidebarProps {
    contacts: string
}

export function AppSidebar({ contacts: contactsJson }: AppSidebarProps) {
    const pathname = usePathname()
    const contacts: IContact[] = JSON.parse(contactsJson)
    console.log(contacts)
    const isActive = (path: string) => {
        return pathname === path
    }

    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <p>Nenichat</p>
            </SidebarHeader>
            <SidebarContent>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link href="/" passHref>
                            <SidebarMenuButton isActive={isActive('/')}>
                                <HomeIcon className="w-4 h-4 mr-2" />
                                Home
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <Link href="/campaigns" passHref>
                            <SidebarMenuButton isActive={isActive('/campaigns')}>
                                <SendIcon className="w-4 h-4 mr-2" />
                                Campañas
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <Link href="/audiences" passHref>
                            <SidebarMenuButton isActive={isActive('/audiences')}>
                                <MailIcon className="w-4 h-4 mr-2" />
                                Audiencias
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>


                </SidebarMenu>
                <SidebarGroup>
                    <SidebarGroupLabel>Contacts</SidebarGroupLabel>
                    <SidebarMenu>
                        {contacts.map((contact: IContact) => (
                            <SidebarMenuItem key={contact.id}>
                                <Link href={`/chats/${contact.id}`} passHref>
                                    <SidebarMenuButton isActive={isActive(`/chats/${contact.id}`)}>
                                        {contact.contact_name || contact.pushname || contact.phone_number}
                                    </SidebarMenuButton>
                                </Link>
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