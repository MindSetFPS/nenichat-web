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
import { getContactName } from "@/Nenichat/Contacts/app/get-contact-name"
import Link from "next/link"
import { useContactStore } from "@/stores/contact-store"

import { useRouter } from "next/navigation"
import { countTokens } from "@/lib/token-count"


interface MessageProps {
    message: IMessageWithSender
    isMe: boolean
    isGroup?: boolean
    showAvatar?: boolean
}

export default function Message({ message, isMe, isGroup = false, showAvatar = true }: MessageProps) {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const getContact = useContactStore((state) => state.getContact)

    const senderContact = getContact(message.sender_jid)
    const senderContactValue = typeof senderContact === 'object' ? senderContact : undefined
    const localName = senderContactValue ? getContactName(senderContactValue) : ""
    const displayName = localName || message.sender_display_name || message.sender_jid

    // Show avatar only in group chats, for first message in consecutive sequence
    const shouldShowAvatar = isGroup && showAvatar && !!displayName && !isMe
    // Show placeholder in group chats for consecutive messages from same sender
    const shouldShowPlaceholder = isGroup && !showAvatar && !isMe

    return (
        <div className="flex gap-2">
            {shouldShowAvatar && (
                <Avatar className="h-8 w-8">
                    <ContactAvatar seed={displayName} />
                    <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            )}
            {shouldShowPlaceholder && <div className="h-8 w-8" />}
            <div
                key={message.id}
                className={cn(
                    "flex flex-row w-max max-w-[75%] border gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer hover:opacity-90 transition-opacity break-all",
                    isMe
                        ? "ml-auto pl-2 pb-2 text-primary rounded-tr-none"
                        : "bg-muted rounded-tl-none"
                )}
            >
                <Accordion type="single" collapsible className="p-0">
                    <AccordionItem value="item-1" className="p-0">
                        {
                            displayName && !isMe && isGroup && showAvatar ?
                                <Link href={`/chats/${message.sender_jid}`}>
                                    <span className="text-xs font-bold">
                                        {displayName}
                                    </span>
                                </Link>
                                : <></>
                        }

                        {!isMe ? (
                            <AccordionTrigger className="items-center p-0 no-underline hover:no-underline">
                                <div className="flex flex-col items-start">
                                    <p className="text-sm py-2 break-words whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                </div>
                            </AccordionTrigger>
                        ) : (
                            <>
                                <p className="text-sm py-2 break-words whitespace-pre-wrap">
                                    {message.content}
                                </p>

                            </>
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
                                            onSubmit={() => {
                                                setOpen(false)
                                                router.refresh()
                                            }}
                                            contact={senderContactValue}
                                            lid={String(message.sender_jid)}
                                            createdAt={new Date(message.created_at)}
                                        />
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </AccordionContent>
                        <span className="block text-[0.6rem] text-muted-foreground">
                            {countTokens(message.content || "")} tokens
                        </span>
                    </AccordionItem>
                </Accordion>

                <span
                    className={cn(
                        "text-[0.5rem] self-end whitespace-nowrap",
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