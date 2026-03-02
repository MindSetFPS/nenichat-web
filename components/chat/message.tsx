"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
// import { IContact } from "@/Nenichat/Contacts/domain/IContact" // Removed unused import
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


interface MessageProps {
    message: IMessageWithSender
    isMe: boolean
}

export default function Message({ message, isMe }: MessageProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex gap-2">
            {
                message.sender && !isMe ?
                    <Avatar className="h-8 w-8">
                        <ContactAvatar seed={getContactIdentifier(message.sender!)!} />
                        <AvatarFallback>{getContactIdentifier(message.sender!)!.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    : <></>
            }
            <div
                key={message.id}
                className={cn(
                    "flex flex-row w-max max-w-[75%] border gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer hover:opacity-90 transition-opacity",
                    isMe
                        ? "ml-auto text-primary rounded-tr-none px-1 py-0"
                        : "bg-muted rounded-tl-none"
                )}
            >
                <Accordion type="single" collapsible className="p-0">
                    <AccordionItem value="item-1" className="p-0">
                        {
                            message.sender && !isMe ?
                                <Link href={`/chats/${message.sender_jid}`}>
                                    <span className="text-xs font-bold">
                                        {getContactIdentifier(message.sender!)}
                                    </span>
                                </Link>
                                : <></>
                        }

                        {!isMe ? (
                            <AccordionTrigger className="items-center p-0">
                                <p className="text-sm py-2">
                                    {message.content}
                                </p>
                            </AccordionTrigger>
                        ) : (
                            <p className="text-sm py-2">
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