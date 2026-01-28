import { Package } from "lucide-react";
import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository";
import { EmptyList } from "@/components/empty-list";
import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier";
import { OrderWithContactName } from "@/Nenichat/Orders/app/dto/order-with-contact-name";
import { CreateOrderButton } from "@/components/orders/create-order-button";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/orders/table/columns";
import { PageHeader } from "@/components/ui/page-header";

const orderRepository = new OrderRepository(pool);

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    let orders: OrderWithContactName[] = await orderRepository.getAll();

    orders = await Promise.all(orders.map(async order => {
        if (order.contact_id) {
            const contact = await contactRepository.findById(BigInt(order.contact_id));
            order.contact_name = getContactIdentifier(contact!)!;
        }
        order.items = await orderRepository.getItems(order.id);
        return order;
    }));

    const plainOrders = JSON.parse(JSON.stringify(orders));

    return (
        <>
            <PageHeader title="Ventas">
                <CreateOrderButton />
            </PageHeader>
            {
                plainOrders.length === 0 ?
                    <EmptyList
                        title="No Orders"
                        description="Start building your order catalog by creating your first order."
                        action={<CreateOrderButton />}
                        icon={<Package className="w-16 h-16 text-primary" strokeWidth={1.5} />}
                    />
                    :
                    <DataTable
                        columns={columns}
                        data={plainOrders}
                        searchInputColumnId="id"
                        showDateSelector={true}
                        showSearchInput={false}
                        visibleColumns={{
                            "updated_at": false,
                            "status": false,
                            "payment_method": false,
                            "refunded_amount": false,
                            "notes": false,
                            "amount_paid": false,
                        }}
                    />
            }
        </>
    );
}
