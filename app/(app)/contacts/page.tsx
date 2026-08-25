import { DataTable } from "@/components/data-table";
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository";
import { columns } from "@/components/contacts/table/columns";
import { PageHeader } from "@/components/ui/page-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBusinessFromUser } from "@/lib/user-auth";
import { GoWappMessageRepository } from "@/Nenichat/Messages/infra/api";

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
        return <div>No autorizado</div>;
    }

    const contactRepository = new SupabaseContactRepository(supabase);
    // const messageRepository = new SupabaseMessageRepository(supabase);
    const messageRepository = new GoWappMessageRepository({ deviceId: String(business.id) })

    // get all the contacts from contacts table
    const result = await contactRepository.list(business.id, 0, 100);
    const contacts = Array.isArray(result) ? result : [];
    let contactWithLastMessageTime = [];

    // get the last message time for each contact
    for (let contact of contacts) {
        try {
            let lastMessage = null;

            // Try in order of importance for the API: phone_number, lid, then id (only for database repositories)
            if (contact.phone_number) {
                lastMessage = await messageRepository.getLastContactMessageByPhone(contact.phone_number);
            }

            if (!lastMessage && contact.lid) {
                lastMessage = await messageRepository.getLastContactMessageByLid(contact.lid);
            }

            if (!lastMessage && contact.id) {
                lastMessage = await messageRepository.getLastContactMessage(contact.id);
            }

            if (lastMessage) {
                contactWithLastMessageTime.push({
                    ...contact,
                    last_message_time: lastMessage.created_at
                });
            }
        } catch {
            // Silently skip if query fails to avoid browser console or overlay errors
        }
    }

    // contacts with newer messages first, contacts without messages last
    contactWithLastMessageTime.sort((a, b) => {
        const aTime = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
        const bTime = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;

        if (aTime && bTime) {
            return bTime - aTime;
        } else if (aTime) {
            return -1;
        } else if (bTime) {
            return 1;
        } else {
            return 0;
        }
    });

    // contacts has all the contacts while contactWithLastMessageTime has the contacts that have sent messages.
    // i need to merge both, no repeat, and order by last_message_time and contacts without messages last
    const mergedContacts = [...contactWithLastMessageTime, ...contacts];
    const uniqueContacts = mergedContacts.filter((contact, index) => mergedContacts.findIndex(c => c.id === contact.id) === index);
    const newContactsJson = JSON.parse(JSON.stringify(uniqueContacts));

    return (
        <>
            <PageHeader title="Contactos" />
            <DataTable
                columns={columns}
                data={newContactsJson}
                searchInputColumnId="phone_number"
                selectedDateDefault="all-time"
            // note: this searches in the phone_number column, if it does not have, it will not match
            // so this component would need global search to provide better results
            />
        </>
    );
}
