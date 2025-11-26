"use client"

import { cn } from "@/lib/utils"
import { IContact } from "@/Nenichat/Contacts/domain/IContact"
import { IMessageWithSender } from "@/Nenichat/Messages/domain/IMessageWithSender"
import { useState, useRef, useEffect } from "react"
import ChatControls from "./chat-controls"
import { Avatar, AvatarFallback } from "../ui/avatar"
import ContactAvatar from "../contact-avatar"
import Link from "next/link"

interface GroupChatViewProps {
    initialMessages: IMessageWithSender[]
    me: IContact | null
}

export default function GroupChatView({
    initialMessages,
    me,
}: GroupChatViewProps) {
    const [messages, setMessages] = useState<IMessageWithSender[]>(initialMessages)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <>
            <main className="flex-1 h-full overflow-y-auto p-4 flex-col space-y-4">
                {messages.map((message) => {
                    const isMe = message.sender_id === me?.id
                    const senderName = message.sender?.pushname || message.sender?.contact_name || message.sender?.phone_number || message.sender?.lid || "Unknown"

                    return (
                        <div
                            key={message.id}
                            className={cn(
                                "flex items-end gap-2",
                                isMe ? "justify-end" : "justify-start"
                            )}
                        >
                            {!isMe && (
                                <Avatar className="h-8 w-8">
                                    <ContactAvatar seed={senderName} />
                                    <AvatarFallback>{senderName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={cn(
                                    "flex w-max max-w-[75%] flex-col gap-1 rounded-lg px-3 py-2 text-sm",
                                    isMe
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                )}
                            >
                                {!isMe && (
                                    <Link href={`/chats/${message.sender_id}`}>
                                        <span className="text-xs font-bold">
                                            {senderName}
                                        </span>
                                    </Link>
                                )}
                                <p>{message.text_content}</p>
                                <span
                                    className={cn(
                                        "text-xs self-end",
                                        isMe
                                            ? "text-primary-foreground/70"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {new Date(message.created_at).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </main>
            <ChatControls />
        </>
    )
}
