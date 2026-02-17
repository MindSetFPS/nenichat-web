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
import { SupabaseOrderRepository } from "@/Nenichat/Orders/infra/persistance/SupabaseOrderRepository";

const orderRepository = new OrderRepository(pool);

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const supabaseOrderRepository = new SupabaseOrderRepository();
    let orders: OrderWithContactName[] = await supabaseOrderRepository.getAll();

    orders = await Promise.all(orders.map(async order => {
        if (order.contact_id) {
            const contact = await contactRepository.findById(Number(order.contact_id));
            order.contact_name = getContactIdentifier(contact!)!;
        }
        order.items = await orderRepository.getItems(order.id);
        return order;
    }));

    const plainOrders = JSON.parse(JSON.stringify(orders));

    return (
        <>
            {
                plainOrders.length === 0 ?
                    <EmptyList
                        title="Sin ordenes"
                        description="Cuando hagas tu primera orden aparecerá aquí."
                        action={<CreateOrderButton />}
                        icon={<Package className="w-16 h-16 text-primary" strokeWidth={1.5} />}
                    />
                    :
                    <>
                        <PageHeader title="Ventas">
                            <CreateOrderButton />
                        </PageHeader>
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
                    </>
            }
        </>
    );
}
