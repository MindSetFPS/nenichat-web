import { pool } from "@/repository/db";
import { ContactRepository } from "@/repository/ContactRepository";
import { OrderRepository } from "@/repository/OrderRepository";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { OrdersTable } from "@/components/orders-table";

const contactRepository = new ContactRepository(pool);
const orderRepository = new OrderRepository(pool);

export const dynamic = 'force-dynamic';

interface ContactDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
    const { id } = await params;
    const contactId = BigInt(id);

    const contact = await contactRepository.findById(contactId);
    if (!contact) {
        notFound();
    }

    // Fetch orders for this contact
    // Note: OrderRepository expects number for contactId currently, but DB is bigint.
    // We cast to number for now as per existing pattern, but this should be fixed in repository.
    const orders = await orderRepository.getByContactId(Number(contactId));

    // Serialize for client component
    const plainOrders = JSON.parse(JSON.stringify(orders));

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Contact Details</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sidebar / Profile */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Name</div>
                                <div className="text-lg font-medium">{contact.contact_name || contact.pushname || 'Unknown'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Phone</div>
                                <div>{contact.phone_number}</div>
                            </div>
                            {contact.username && (
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Username</div>
                                    <div>@{contact.username}</div>
                                </div>
                            )}
                            {contact.lid && (
                                <div>
                                    <div className="text-sm font-medium text-gray-500">LID</div>
                                    <div className="text-xs text-gray-400 break-all">{contact.lid}</div>
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
                                <div className="text-sm font-medium text-gray-500">Total Spent</div>
                                <div className="text-2xl font-bold text-green-600">
                                    ${orders.reduce((sum, order) => sum + Number(order.total_amount), 0).toFixed(2)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content / History */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OrdersTable orders={plainOrders} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
