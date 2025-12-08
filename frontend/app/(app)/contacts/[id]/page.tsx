import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { ContactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/orders/table/data-table";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react"
import Link from "next/link";
import ChatHeader from "@/components/chat/chat-header";
import { PageHeader } from "@/components/ui/page-header";
import { columns } from "@/components/orders/table/columns";

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
    const orders = await orderRepository.getByContactId(Number(contactId));

    // Serialize for client component
    const plainOrders = JSON.parse(JSON.stringify(orders));
    const plainContact = JSON.parse(JSON.stringify(contact));

    return (
        <>
            <PageHeader content={
                <div className="md:flex items-center gap-2 w-full">
                    <ChatHeader contact={plainContact!} />
                </div>
            } />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mt-4 overflow-y-auto" >
                <Card className="space-y-2 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Order History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={plainOrders} />
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
                        </CardContent>
                    </Card>
                </div>


            </div >
        </ >
    );
}
