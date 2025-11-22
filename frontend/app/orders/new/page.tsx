import { CreateOrderForm } from "@/components/forms/CreateOrderForm";
import { pool } from "@/repository/db";
import { ContactRepository } from "@/Nenichat/Chats/infra/persistance/ContactRepository";
import { ProductRepository } from "@/repository/ProductRepository";

const contactRepository = new ContactRepository(pool);
const productRepository = new ProductRepository(pool);

export const dynamic = 'force-dynamic';

export default async function NewOrderPage() {
    const contacts = await contactRepository.list(0, 100);
    const products = await productRepository.getAll();

    // Serialize for client component
    const plainContacts = JSON.parse(JSON.stringify(contacts));
    const plainProducts = JSON.parse(JSON.stringify(products));

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Create New Order</h1>
            <CreateOrderForm contacts={plainContacts} products={plainProducts} />
        </div>
    );
}
