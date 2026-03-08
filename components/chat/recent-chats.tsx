'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { getContactIdentifier } from '@/Nenichat/Contacts/app/get-contact-identifier'
import ContactAvatar from '@/components/contact-avatar'
import dateToHuman from '@/Nenichat/Shared/app/date-to-human'
import { cn } from "@/lib/utils"
import { useIsMobile } from '@/hooks/use-mobile'
import { PageHeader } from '../ui/page-header'
import { IChat } from '@/Nenichat/Chats/domain/IChat'
import { useContactStore } from '@/stores/contact-store'
import { useMemo, useEffect } from 'react'

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
 * @param {string} props.contacts - JSON string of chats with last messages
 * @returns {JSX.Element} The rendered RecentChats component.
 */
export function RecentChats({ contacts: contactsJson, className }: RecentChatsProps) {
    const pathname = usePathname()
    const router = useRouter()
    const isMobile = useIsMobile()

    const chats: IChat[] = useMemo(() => {
        return (JSON.parse(contactsJson) as IChat[])
            .filter(chat => chat.jid !== 'status@broadcast')
    }, [contactsJson])

    const getContact = useContactStore((state) => state.getContact)
    const fetchContacts = useContactStore((state) => state.fetchContacts)
    const contactsByPhone = useContactStore((state) => state.contactsByPhone)
    const contactsByLid = useContactStore((state) => state.contactsByLid)

    useEffect(() => {
        const jids = chats.map(chat => chat.jid)
        if (jids.length > 0) {
            fetchContacts(jids)
        }
    }, [chats, fetchContacts])

    // Filter out hidden contacts using cached contacts
    const visibleChats = useMemo(() => {
        return chats.filter(chat => {
            const contact = getContact(chat.jid);
            return !contact?.is_hidden;
        });
    }, [chats, getContact, contactsByPhone, contactsByLid])

    const getContactName = (chat: IChat): string => {
        const contact = getContact(chat.jid);
        if (contact && contact.contact_name) {
            return contact.contact_name;
        }
        return chat.name || (contact ? String(getContactIdentifier(contact)) : '');
    }

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
            <div className="p-4 border-b">
                <PageHeader title="Tus chats" />
                <Input type="text" className="w-full border-none rounded-lg mt-2" placeholder="Buscar" />
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-none">
                {visibleChats.map((chat: IChat) => (
                    <div
                        key={chat.jid}
                        className={`p-3 hover:bg-accent/40 cursor-pointer transition-colors group ${isActive(`/chats/${chat.jid}`) ? 'bg-accent/40' : ''}`}
                        onClick={() => changeRoute(`/chats/${chat.jid}`)}
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className="size-6 lg:size-8 shrink-0">
                                <ContactAvatar seed={getContactIdentifier(chat.jid.toString())!} />
                                <AvatarFallback>
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-sm font-medium truncate">
                                        {getContactName(chat)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {(() => {
                                            const createdAt = chat.last_message_time;
                                            return dateToHuman(String(createdAt));
                                        })()}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate leading-tight">
                                    {/* {chat.last_message?.text_content} */}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
