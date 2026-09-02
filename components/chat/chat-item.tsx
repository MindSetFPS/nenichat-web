'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getContactName } from '@/Nenichat/Contacts/app/get-contact-name'
import ContactAvatar from '@/components/contact-avatar'
import dateToHuman from '@/Nenichat/Shared/app/date-to-human'
import { IContact } from '@/Nenichat/Contacts/domain/IContact'

interface ChatItemProps {
    contact: IContact & { chat_jid: string; last_message_time: Date }
    isActive: boolean
    onClick: () => void
}

export function ChatItem({ contact, isActive, onClick }: ChatItemProps) {
    return (
        <div
            className={`p-3 hover:bg-accent/40 cursor-pointer transition-colors group ${isActive ? 'bg-accent/40' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                <Avatar className="size-6 lg:size-8 shrink-0">
                    <ContactAvatar seed={getContactName(contact)!} />
                    <AvatarFallback>
                        <AvatarImage src="https://github.com/shadcn.png" />
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                        <span className="text-sm font-medium truncate">
                            {getContactName(contact)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                            {dateToHuman(String(contact.last_message_time))}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate leading-tight">
                    </p>
                </div>
            </div>
        </div>
    )
}
