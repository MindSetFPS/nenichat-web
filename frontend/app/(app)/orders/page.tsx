import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EmptyList } from "@/components/empty-list";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/orders/table/columns";
import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier";
import { OrderWithContactName } from "@/Nenichat/Orders/app/dto/order-with-contact-name";

const orderRepository = new OrderRepository(pool);

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    let orders: OrderWithContactName[] = await orderRepository.getAll();

    orders = await Promise.all(orders.map(async order => {
        const contact = await contactRepository.findById(BigInt(order.contact_id!));
        order.contact_name = getContactIdentifier(contact!)!;
        return order;
    }));

    const plainOrders = JSON.parse(JSON.stringify(orders));

    function CreateOrderButton() {
        return (
            <Link href="/orders/new">
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Order
                </Button>
            </Link>
        )
    }

    return (
        <>
            <PageHeader content={
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Orders</h1>
                    {
                        plainOrders.length != 0 ?
                            <CreateOrderButton />
                            :
                            null
                    }
                </div>
            } />
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
                        searchInputColumnId="id"
                        visibleColumns={{
                            "updated_at": false,
                            "payment_method": false,
                            "refunded_amount": false,
                            "notes": false,
                        }}
                        data={plainOrders}
                    />
            }
        </>
    );
}
