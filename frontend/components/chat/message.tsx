"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { IContact } from "@/Nenichat/Contacts/domain/IContact"
import { IMessage } from "@/Nenichat/Messages/domain/IMessage"
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

interface MessageProps {
    message: IMessage
    me: IContact | null
}

export default function Message({ message, me }: MessageProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <div
                key={message.id}
                className={cn(
                    "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer hover:opacity-90 transition-opacity",
                    message.sender_id === me?.id
                        ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted rounded-tl-none"
                )}
            >
                <Accordion type="single" collapsible className="p-0">
                    <AccordionItem value="item-1" className="p-0">
                        <AccordionTrigger className="items-center p-0">
                            <p className="text-sm py-2">
                                {message.text_content}
                            </p>
                        </AccordionTrigger>
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
                                            <span className="text-primary">"{message.text_content}"</span>
                                            <span className="text-muted-foreground text-sm block">{new Date(message.created_at).toLocaleString()}</span>
                                        </div>
                                        <CreateOrderForm contactId={String(message.sender_id)} createdAt={message.created_at} />
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <span
                    className={cn(
                        "text-xs self-end",
                        message.sender_id === me?.id
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
        </>
    )
}