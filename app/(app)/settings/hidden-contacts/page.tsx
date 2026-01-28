import ContactAvatar from "@/components/contact-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier";
import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import Link from "next/link";

export default async function HiddenContactsPage() {
    const hiddenContacts = await contactRepository.getHiddenContacts(0, 10);
    console.log(hiddenContacts);
    return (
        <>

            <h2 className="text-2xl font-semibold tracking-tight">Hidden Contacts</h2>

            <main className="flex-1 overflow-y-auto w-full">
                <div className="p-2 max-w-3xl w-full">
                    <p className="text-muted-foreground mt-1 mb-4">
                        Manage contacts you have hidden from your list.
                    </p>
                    <ul className="w-full">
                        {hiddenContacts.map((contact) => (
                            <Link
                                key={contact.id}
                                href={`/chats/${contact.id}`} passHref
                                className='w-full mt-2 flex items-center hover:bg-accent py-2 ml-1 rounded-lg truncate overflow-hidden whitespace-nowrap'>
                                <Avatar className="h-full">
                                    <ContactAvatar seed={getContactIdentifier(contact!)!} />
                                    <AvatarFallback>
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col py-0">
                                    <span className="font-semibold">
                                        {contact.contact_name || contact.pushname || contact.phone_number || contact.lid}
                                    </span>
                                    <span className="text-xs text-muted-foreground text-ellipsis">
                                        Ver chat
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </ul>
                </div>
            </main>
        </>
    )
}