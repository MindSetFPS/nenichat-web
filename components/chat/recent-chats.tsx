'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { getContactIdentifier } from '@/Nenichat/Contacts/app/get-contact-identifier'
import ContactAvatar from '@/components/contact-avatar'
import IContactWithLastMessage from '@/Nenichat/Contacts/app/dtos/IContactWithLastMessage'
import dateToHuman from '@/Nenichat/Shared/app/date-to-human'
import { cn } from "@/lib/utils"
import { useIsMobile } from '@/hooks/use-mobile'
import { SidebarTrigger } from '../ui/sidebar'

interface RecentChatsProps {
    contacts: string
    className?: string
}

/**
 * RecentChats component displays a list of recent conversations in the app layout.
 * It provides a search input and a scrollable list of chats with contact information.
 * On mobile, it's hidden when viewing a chat and shown when on the chats list.
 * 
 * @param {RecentChatsProps} props - Component props
 * @param {string} props.contacts - JSON string of contacts with last messages
 * @returns {JSX.Element} The rendered RecentChats component.
 */
export function RecentChats({ contacts: contactsJson, className }: RecentChatsProps) {
    const pathname = usePathname()
    const router = useRouter()
    const isMobile = useIsMobile()
    const contacts: IContactWithLastMessage[] = JSON.parse(contactsJson)

    // Check if we're viewing a specific chat (has an ID after /chats/)
    const isViewingChat = pathname.match(/^\/chats\/[^/]+$/)

    // On mobile, hide when viewing a specific chat
    if (isMobile && isViewingChat) {
        return null
    }

    const isActive = (path: string) => {
        return pathname === path
    }

    function changeRoute(route: string) {
        router.push(route)
    }

    return (
        <div className={cn("flex flex-col h-full overflow-hidden", className, {
            "hidden lg:flex": isMobile && isViewingChat,
        })}>
            <div className="p-2 md:p-4 border-b">
                <div className="flex items-center h-8">
                    <SidebarTrigger className="size-auto mr-2 text-muted-foreground" />
                    <h2 className="text-md font-bold tracking-wider text-muted-foreground">Tus chats</h2>
                </div>
                <Input type="text" className="w-full border-none rounded-lg mt-2" placeholder="Buscar" />
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-none">
                {contacts.map((contact: IContactWithLastMessage) => (
                    <div
                        key={contact.id}
                        className={`p-3 hover:bg-accent/40 cursor-pointer transition-colors group ${isActive(`/chats/${contact.id}`) ? 'bg-accent/40' : ''}`}
                        onClick={() => changeRoute(`/chats/${contact.id}`)}
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className="size-8 shrink-0">
                                <ContactAvatar seed={getContactIdentifier(contact!)!} />
                                <AvatarFallback>
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-sm font-medium truncate">
                                        {contact.contact_name || contact.pushname || contact.phone_number || contact.lid}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {(() => {
                                            const createdAt = contact.last_message?.created_at;
                                            return dateToHuman(String(createdAt));
                                        })()}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate leading-tight">
                                    {contact.last_message?.text_content}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
