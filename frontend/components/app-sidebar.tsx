'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { HomeIcon, UsersIcon, SendIcon, MailIcon, PackageIcon } from 'lucide-react'
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
    const isActive = (path: string) => {
        return pathname === path
    }

    return (
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader>
                {/* <p>Nenichat</p> */}
            </SidebarHeader>
            <SidebarContent>

                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/')}>
                                <Link href="/" passHref>
                                    <HomeIcon className="w-4 h-4 " />
                                    <span>
                                        Home
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/campaigns')}>
                                <Link href="/campaigns" passHref>
                                    <SendIcon className="w-4 h-4 " />
                                    <span>

                                        Campañas
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/audiences')}>
                                <Link href="/audiences" passHref>
                                    <MailIcon className="w-4 h-4 " />
                                    <span>

                                        Audiencias
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/products')}>
                                <Link href="/products" passHref>
                                    <PackageIcon className="w-4 h-4 " />
                                    <span>

                                        Products
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
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
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            {/* <AvatarFallback> */}
                                            {/* </AvatarFallback> */}
                                        </Avatar>
                                        <span>
                                            {contact.contact_name || contact.pushname || contact.phone_number}
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