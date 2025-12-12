import { Contact } from "@/Nenichat/Contacts/domain/Contact";
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier";
import { ChatDropDownDialog } from "./chat-dropdown";
import { Avatar, AvatarFallback } from "../ui/avatar";
import ContactAvatar from "../contact-avatar";
import Link from "next/link";

interface ChatHeaderProps {
    contact: Contact;
}

export default function ChatHeader({ contact }: ChatHeaderProps) {
    const contactName = getContactIdentifier(contact)
    return (
        <div className="flex items-center justify-between w-full">
            <div className="">
                <div className="flex items-center gap-2 w-full max-w-xs">
                    <Avatar>
                        <ContactAvatar seed={getContactIdentifier(contact)!} />
                        <AvatarFallback>
                            {getContactIdentifier(contact)?.charAt(0) || "C"}
                        </AvatarFallback>
                    </Avatar>
                    <Link href={`/contacts/${contact.id}`}>
                        <h1 className="text-2xl font-bold ">{contactName}</h1>
                    </Link>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 w-full text-xs text-muted-foreground">
                    <span>
                        {contact?.id ? `${contact.id} (ID)` : <></>}
                    </span>
                    {contactName !== contact?.username && (
                        <span>
                            {contact?.username ? `${contact.username} (Username)` : <></>}
                        </span>
                    )}
                    {contactName !== contact?.pushname && (
                        <span>
                            {contact?.pushname ? `${contact.pushname} (Pushname)` : <></>}
                        </span>
                    )}
                    {contactName !== contact?.contact_name && (
                        <span>
                            {contact?.contact_name ? `${contact.contact_name} (Contact Name)` : <></>}
                        </span>
                    )}
                    <span>
                        {contact?.phone_number ? `${contact.phone_number} (Phone Number)` : <></>}
                    </span>
                    <span>
                        {contact?.lid ? `${contact.lid} (LID)` : <></>}
                    </span>
                </div>
            </div>
            <ChatDropDownDialog contact={contact!} />
        </div>
    )
}