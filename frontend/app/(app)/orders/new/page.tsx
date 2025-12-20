import { CreateOrderForm } from "@/components/forms/create-order-form";
import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { ContactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { HeaderAction } from "@/components/header-action";

const contactRepository = new ContactRepository(pool);

export const dynamic = 'force-dynamic';

export default async function NewOrderPage() {
    const contacts = await contactRepository.list(0, 100);

    // Serialize for client component
    const plainContacts = JSON.parse(JSON.stringify(contacts));

    return (
        <>
            <HeaderAction>
                <h1 className="text-2xl font-bold">Create New Order</h1>
            </HeaderAction>
            <CreateOrderForm contacts={plainContacts} className="mt-4" />
        </>
    );
}
