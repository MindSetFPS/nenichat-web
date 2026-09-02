'use client'

import { useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useIsMobile } from '@/hooks/use-mobile'
import { PageHeader } from '../ui/page-header'
import { IChat } from '@/Nenichat/Chats/domain/IChat'
import { IContact } from '@/Nenichat/Contacts/domain/IContact'
import { useContactStore } from '@/stores/contact-store'
import { ChatItem } from './chat-item'

interface RecentChatsProps {
    chatsSortedByLastMessage: string // JSON barely has any data. we still need to fetch contact data for each chat. this is a serialized IChat[].
    className?: string
}

export function RecentChats({ chatsSortedByLastMessage: chatsSortedByLastMessageJson, className }: RecentChatsProps) {
    const pathname = usePathname()
    const router = useRouter()
    const isMobile = useIsMobile()

    const chatsToFetch: IChat[] = useMemo(() => {
        return (JSON.parse(chatsSortedByLastMessageJson) as IChat[])
            .filter(chat => chat.jid !== 'status@broadcast')
    }, [chatsSortedByLastMessageJson])

    const getContact = useContactStore((state) => state.getContact)
    const contactsByPhone = useContactStore((state) => state.contactsByPhone)
    const contactsByLid = useContactStore((state) => state.contactsByLid)

    // Transform chats to contacts, filter hidden, sort by last_message_time
    const visibleContacts: (IContact & { chat_jid: string; last_message_time: Date })[] = useMemo(() => {
        return chatsToFetch
            .map(chat => ({
                chat,
                contact: getContact(chat.jid)
            }))
            .filter(({ contact }) => !contact?.is_hidden)
            .map(({ chat, contact }) => ({
                ...contact!,
                chat_jid: chat.jid,
                last_message_time: chat.last_message_time
            }))
            .sort((a, b) => {
                const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
                const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
                return timeB - timeA;
            });
    }, [chatsToFetch, getContact, contactsByPhone, contactsByLid])

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
                {visibleContacts.map((contact) => (
                    <ChatItem
                        key={contact.chat_jid}
                        contact={contact}
                        isActive={isActive(`/chats/${contact.chat_jid}`)}
                        onClick={() => changeRoute(`/chats/${contact.chat_jid}`)}
                    />
                ))}
            </div>
        </div>
    )
}
