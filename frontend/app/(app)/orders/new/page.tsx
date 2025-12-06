import { CreateOrderForm } from "@/components/forms/create-order-form";
import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { ContactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { PageHeader } from "@/components/ui/page-header";

const contactRepository = new ContactRepository(pool);

export const dynamic = 'force-dynamic';

export default async function NewOrderPage() {
    const contacts = await contactRepository.list(0, 100);

    // Serialize for client component
    const plainContacts = JSON.parse(JSON.stringify(contacts));

    return (
        <>
            <PageHeader content={<h1 className="text-3xl font-bold tracking-tight">Create New Order</h1>} />
            <CreateOrderForm contacts={plainContacts} className="mt-4" />
        </>
    );
}
