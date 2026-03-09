'use client';

import Link from "next/link";
import { Mail } from "lucide-react";
import { useEffect } from "react";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { phoneNumberToJid } from "@/Nenichat/Chats/domain/Jid";
import { useContactStore } from "@/stores/contact-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { columns } from "@/components/orders/table/columns";
import { ChatDropDownDialog } from "@/components/chat/chat-dropdown";
import { OrdersByDayChart } from "@/components/contacts/orders-by-day-chart";
import { PageHeader } from "@/components/ui/page-header";

interface ContactClientPageProps {
    initialContact: IContact;
    orders: any[];
    ordersByDay: any[];
}

export function ContactClientPage({ initialContact, orders, ordersByDay }: ContactClientPageProps) {
    const { getContact, setContact } = useContactStore();

    useEffect(() => {
        setContact(initialContact);
    }, [initialContact, setContact]);

    const storeContact = getContact(initialContact.phone_number || initialContact.lid!) || initialContact;
    const contactName = storeContact.contact_name || storeContact.pushname || 'Unknown';

    return (
        <>
            <PageHeader title={contactName}>
                <ChatDropDownDialog contact={storeContact} />
            </PageHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 pt-4">

                <div className="space-y-2 md:col-span-2 h-full gap-0">
                    <CardHeader className="px-2 py-0">
                        <CardTitle>Order History</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full px-2 py-0">
                        <DataTable
                            columns={columns}
                            showDateSelector={true}
                            data={orders}
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
                            }}
                        />
                    </CardContent>
                </div>

                <div className="md:col-span-1 md:col-start-3 space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between align-middle items-center">
                                <CardTitle>Profile</CardTitle>
                                <Link href={`/chats/${phoneNumberToJid(storeContact.phone_number || storeContact.lid!)}`}>
                                    <Button>
                                        <Mail />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Name</div>
                                <div className="text-lg font-medium">{contactName}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Phone</div>
                                <div>{storeContact.phone_number}</div>
                            </div>
                            {storeContact.username && (
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Username</div>
                                    <div>@{storeContact.username}</div>
                                </div>
                            )}
                            {storeContact.lid && (
                                <div>
                                    <div className="text-sm font-medium text-gray-500">LID</div>
                                    <div className="text-xs text-gray-400 break-all">{storeContact.lid}</div>
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
        </>
    );
}
