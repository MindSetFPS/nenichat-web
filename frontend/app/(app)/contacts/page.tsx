import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table";
import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { columns } from "@/components/contacts/table/columns";
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository";

export default async function ContactsPage() {

    // get all the contacts from contacts table
    let contacts = await contactRepository.list(0, 10000);
    let contactWithLastMessageTime = [];

    // get the last message time for each contact
    for (let contact of contacts) {
        const lastMessage = await messageRepository.getLastContactMessage(contact.id!);
        if (lastMessage) {
            contactWithLastMessageTime.push({
                ...contact,
                last_message_time: lastMessage.created_at
            });
        }
    }

    // contacts with newer messages first, contacts without messages last
    contactWithLastMessageTime.sort((a, b) => {
        if (a.last_message_time && b.last_message_time) {
            return b.last_message_time.getTime() - a.last_message_time.getTime();
        } else if (a.last_message_time) {
            return -1;
        } else if (b.last_message_time) {
            return 1;
        } else {
            return 0;
        }
    });

    // contacts has all the contacts while contactWithLastMessageTime has the contacts that have sent messages.
    // i need to merge both, no repeat, and order by last_message_time and contacts without messages last
    const mergedContacts = [...contactWithLastMessageTime, ...contacts]; // , 
    const uniqueContacts = mergedContacts.filter((contact, index) => mergedContacts.findIndex(c => c.id === contact.id) === index);
    const newContactsJson = JSON.parse(JSON.stringify(uniqueContacts));

    return (
        <>
            <PageHeader content={<h1 className="text-2xl font-bold">Contacts</h1>} />

            <DataTable
                columns={columns}
                data={newContactsJson}
                searchInputColumnId="phone_number"
            // note: this searches in the phone_number column, if it does not have, it will not match
            // so this component would need global search to provide better results
            />
        </>
    );
}
