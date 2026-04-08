import { Avatar, AvatarFallback } from "../ui/avatar";
import ContactAvatar from "../contact-avatar";
import Link from "next/link";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { getContactName } from "@/Nenichat/Contacts/app/get-contact-name";

interface ChatHeaderProps {
    contact: IContact;
    chatName?: string;
}

export default function ChatHeader({ contact, chatName }: ChatHeaderProps) {
    console.log("contact", contact)
    console.log("chatName", chatName)
    const contactName = getContactName(contact, chatName ? { name: chatName } as any : null) || "Unknown"

    return (
        <div className="flex items-center justify-between w-full">
            <div className="">
                <div className="flex items-center gap-2 w-full ">
                    <Avatar>
                        <ContactAvatar seed={contactName} />
                        <AvatarFallback>
                            {contactName ? contactName.charAt(0).toUpperCase() : "C"}
                        </AvatarFallback>
                    </Avatar>
                    <div>

                        <Link href={`/contacts/${contact?.id || "#"}`}>
                            <h1 className="text-lg md:text-xl font-bold ">{contactName}</h1>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}