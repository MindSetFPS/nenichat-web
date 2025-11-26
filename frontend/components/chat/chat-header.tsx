import { Contact } from "@/Nenichat/Contacts/domain/Contact";
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier";
import { ChatDropDownDialog } from "./chat-dropdown";

interface ChatHeaderProps {
    contact?: Contact;
}

export default function ChatHeader({ contact }: ChatHeaderProps) {
    const contactName = getContactIdentifier(contact!)
    return (
        <header className="flex items-center justify-between w-full">
            <div className="flex flex-wrap items-center gap-x-4 w-full text-xs text-muted-foreground">
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
            <ChatDropDownDialog contact={contact!} />
        </header>
    )
}