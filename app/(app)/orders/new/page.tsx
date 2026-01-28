import { CreateOrderForm } from "@/components/forms/create-order-form";
import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { ContactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { PageHeader } from "@/components/ui/page-header";

const contactRepository = new ContactRepository(pool);
export const dynamic = 'force-dynamic';

export default async function NewOrderPage() {
    const contacts = await contactRepository.findRecentContacts(100);
    // Serialize for client component
    const plainContacts = JSON.parse(JSON.stringify(contacts));
    return (
        <>
            <PageHeader title="Crear Nueva Orden" />
            <CreateOrderForm contacts={plainContacts} className="mt-4" />
        </>
    );
}
