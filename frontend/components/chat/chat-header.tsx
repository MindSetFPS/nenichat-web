import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Contact } from "@/Nenichat/Contacts/domain/Contact";
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier";
import { ChatDropDownDialog } from "./chat-dropdown";
import Link from "next/link";
import ContactAvatar from "../contact-avatar";

interface ChatHeaderProps {
    contact?: Contact;
}

export default function ChatHeader({ contact }: ChatHeaderProps) {
    const contactName = getContactIdentifier(contact!)
    return (
        <header className="flex items-center justify-between p-4 border-b shrink-0">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="sm:hidden">
                    <ArrowLeft />
                </Button>
                <Avatar>
                    <ContactAvatar seed={contactName!} />
                    <AvatarFallback>
                        {contactName?.charAt(0) || "C"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-lg font-semibold">
                        <Link href={`/contacts/${contact?.id}`}>
                            {contactName || "Unknown Contact"}
                        </Link>
                    </h2>
                    <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                        <span>
                            {contact?.id ? `${contact.id} (ID)` : "No ID"}
                        </span>
                        {contactName !== contact?.username && (
                            <span>
                                {contact?.username ? `${contact.username} (Username)` : "No Username"}
                            </span>
                        )}
                        {contactName !== contact?.pushname && (
                            <span>
                                {contact?.pushname ? `${contact.pushname} (Pushname)` : "No Pushname"}
                            </span>
                        )}
                        {contactName !== contact?.contact_name && (
                            <span>
                                {contact?.contact_name ? `${contact.contact_name} (Contact Name)` : "No Contact Name"}
                            </span>
                        )}
                        <span>
                            {contact?.phone_number ? `${contact.phone_number} (Phone Number)` : "No Phone Number"}
                        </span>
                        <span>
                            {contact?.lid ? `${contact.lid} (LID)` : "No LID"}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <ChatDropDownDialog contact={contact!} />
            </div>
        </header>
    )
}