import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react"
import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { ContactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { columns } from "@/components/orders/table/columns";
import { ChatDropDownDialog } from "@/components/chat/chat-dropdown";
import { OrdersByDayChart } from "@/components/contacts/orders-by-day-chart";
import { PageHeader } from "@/components/ui/page-header";

const contactRepository = new ContactRepository(pool);
const orderRepository = new OrderRepository(pool);

export const dynamic = 'force-dynamic';

interface ContactDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
    const { id } = await params;
    const contactId = BigInt(id);

    let contact = await contactRepository.findById(contactId);
    if (!contact) {
        notFound();
    }

    // Fetch orders for this contact
    // Note: OrderRepository expects number for contactId currently, but DB is bigint.
    // We cast to number for now as per existing pattern, but this should be fixed in repository.
    // We cast to number for now as per existing pattern, but this should be fixed in repository.
    const orders = await orderRepository.getByContactId(Number(contactId));
    const ordersByDay = await orderRepository.getOrdersCountByDayOfWeek(Number(contactId));

    // Serialize for client component
    const plainOrders = JSON.parse(JSON.stringify(orders));
    const plainContact = JSON.parse(JSON.stringify(contact));

    return (
        <>
            <PageHeader title={plainContact.contact_name || plainContact.pushname || 'Unknown'}>
                <ChatDropDownDialog contact={plainContact!} />
            </PageHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 pt-4 overflow-y-auto" >
                <Card className="space-y-2 md:col-span-2 h-full gap-0">
                    <CardHeader className="px-2 py-0">
                        <CardTitle>Order History</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full px-2 py-0">
                        <DataTable
                            columns={columns}
                            showDateSelector={true}
                            data={plainOrders}
                            showSearchInput={false}
                            selectedDateDefault={"this-month"}
                            showColumnsVisibilityDropdown={false}
                            visibleColumns={{
                                contact_id: false,
                                status: false,
                                payment_method: false,
                                refunded_amount: false,
                                notes: false,
                                updated_at: false,
                            }} />
                    </CardContent>
                </Card>

                <div className="md:col-span-1 md:col-start-3 space-y-4">
                    <Card >
                        <CardHeader>
                            <div className="flex justify-between align-middle items-center  ">
                                <CardTitle>Profile</CardTitle>
                                <Link href={`/chats/${plainContact.id}`}>
                                    <Button>
                                        <Mail />
                                    </Button>
                                </Link>

                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Name</div>
                                <div className="text-lg font-medium">{plainContact.contact_name || plainContact.pushname || 'Unknown'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Phone</div>
                                <div>{plainContact.phone_number}</div>
                            </div>
                            {plainContact.username && (
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Username</div>
                                    <div>@{plainContact.username}</div>
                                </div>
                            )}
                            {plainContact.lid && (
                                <div>
                                    <div className="text-sm font-medium text-gray-500">LID</div>
                                    <div className="text-xs text-gray-400 break-all">{plainContact.lid}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Total Orders</div>
                                <div className="text-2xl font-bold">{orders.length}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Valor de las compras</div>
                                <div className="text-2xl font-bold">
                                    ${orders.reduce((sum, order) => sum + Number(order.total_amount), 0).toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Cobrado</div>
                                <div className="text-2xl font-bold">
                                    ${orders.reduce((sum, order) => sum + Number(order.amount_paid), 0).toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Deuda</div>
                                <div className="text-2xl font-bold text-red-400">
                                    ${orders.reduce((sum, order) => sum + Number(order.total_amount - order.amount_paid), 0).toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <OrdersByDayChart data={ordersByDay} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ >
    );
}
