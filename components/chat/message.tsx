"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { CreateOrderForm } from "../forms/create-order-form"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { IMessageWithSender } from "@/Nenichat/Messages/domain/IMessageWithSender"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ContactAvatar from "../contact-avatar"
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier"
import Link from "next/link"
import { useContactStore } from "@/stores/contact-store"


interface MessageProps {
    message: IMessageWithSender
    isMe: boolean
    isGroup?: boolean
    showAvatar?: boolean
}

export default function Message({ message, isMe, isGroup = false, showAvatar = true }: MessageProps) {
    const [open, setOpen] = useState(false)
    const getContact = useContactStore((state) => state.getContact)
    const senderContact = getContact(message.sender_jid)
    const senderContactValue = typeof senderContact === 'object' ? senderContact : undefined

    // Show avatar only in group chats, for first message in consecutive sequence
    const shouldShowAvatar = isGroup && showAvatar && senderContact && !isMe
    // Show placeholder in group chats for consecutive messages from same sender
    const shouldShowPlaceholder = isGroup && !showAvatar && !isMe

    return (
        <div className="flex gap-2">
            {shouldShowAvatar && (
                <Avatar className="h-8 w-8">
                    <ContactAvatar seed={getContactIdentifier(senderContact)!} />
                    <AvatarFallback>{getContactIdentifier(senderContact)!.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            )}
            {shouldShowPlaceholder && <div className="h-8 w-8" />}
            <div
                key={message.id}
                className={cn(
                    "flex flex-row w-max max-w-[75%] border gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer hover:opacity-90 transition-opacity break-all",
                    isMe
                        ? "ml-auto text-primary rounded-tr-none px-1 py-0"
                        : "bg-muted rounded-tl-none"
                )}
            >
                <Accordion type="single" collapsible className="p-0">
                    <AccordionItem value="item-1" className="p-0">
                        {
                            senderContact && !isMe && isGroup && showAvatar ?
                                <Link href={`/chats/${message.sender_jid}`}>
                                    <span className="text-xs font-bold">
                                        {getContactIdentifier(senderContact)}
                                    </span>
                                </Link>
                                : <></>
                        }

                        {!isMe ? (
                            <AccordionTrigger className="items-center p-0">
                                <p className="text-sm py-2 break-words">
                                    {message.content}
                                </p>
                            </AccordionTrigger>
                        ) : (
                            <p className="text-sm py-2 break-words">
                                {message.content}
                            </p>
                        )}

                        <AccordionContent>
                            <div className="">
                                <Sheet open={open} onOpenChange={setOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="outline">Crear venta</Button>
                                    </SheetTrigger>
                                    <SheetContent className="scroll-auto overflow-y-auto px-2">
                                        <SheetHeader className="p-0 pt-2">
                                            <SheetTitle>Crear venta</SheetTitle>
                                        </SheetHeader>
                                        <SheetDescription>
                                            Create an order for this contact.
                                        </SheetDescription>
                                        <div
                                            className="bg-muted font-normal italic text-primary-foreground p-3 rounded-b-lg rounded-tr-lg">
                                            <span className="text-primary">"{message.content}"</span>
                                            <span className="text-muted-foreground text-sm block">{new Date(message.created_at).toLocaleString()}</span>
                                        </div>
                                        <CreateOrderForm
                                            onSubmit={() => setOpen(false)}
                                            contact={senderContactValue}
                                            lid={String(message.sender_jid)}
                                            createdAt={new Date(message.created_at)}
                                        />
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <span
                    className={cn(
                        "text-[0.5rem] self-end",
                        isMe
                            ? "text-primary/70"
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
}